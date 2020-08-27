/*
    localarea_search.cpp ( kadai A2 )
    network programming
    bi18027 / yuratwc
*/
#include<iostream>
#include<thread>
#include<vector>
#include<fstream>
#include<chrono>
#include"rawsocket.hpp"

#define MAX_MACHINE_COUNT 100
#define DEFAULT_NETWORK_INTERFACE "eth0"



in_addr_t get_ip(const raw_socket& soc, const std::string& device_name)
{
	struct ifreq ifr;
	ifr.ifr_addr.sa_family = PF_INET;
    char* device = (char*)(device_name.c_str());
	std::strncpy(ifr.ifr_name, device, IFNAMSIZ - 1);

	// get ip address for the network interface
	if ( ioctl(soc.get_socket(), SIOCGIFADDR, &ifr) == -1 ) {
		perror("ioctl: SIOCGIFADDR");
		return 0;
	}
	return ((struct sockaddr_in *)&(ifr.ifr_addr))->sin_addr.s_addr;
}

// get mac address for the network interface
mac_addr get_mac_addr(const raw_socket& soc, std::string device_name)
{
	struct ifreq ifr;
	ifr.ifr_addr.sa_family = PF_INET;
    char* device = (char*)(device_name.c_str());
	std::strncpy(ifr.ifr_name, device, IFNAMSIZ - 1);
	if ( ioctl(soc.get_socket(), SIOCGIFHWADDR, &ifr) == -1 ) {
		perror("ioctl: SIOCGIFHWADDR");
        return mac_addr();
	}
    u_int8_t res[6];
	for (int i = 0; i < 6; i++)
	{
		res[i] = ifr.ifr_hwaddr.sa_data[i];
	}
    return mac_addr(res);
}

ether_arp* receive_arp_packet(char data[BUFFER_SIZE], int size)
{
	if (size < sizeof(struct ether_header))
	{
		return nullptr;
	}

	struct ether_header* eh = (struct ether_header*) data;
	char *body = data + sizeof(struct ether_header);
	int body_size = size - sizeof(struct ether_header);

	if (body_size < sizeof(struct ether_arp))
	{
		return nullptr;
	}

	if (ntohs(eh->ether_type) == ETHERTYPE_ARP)
	{
		struct ether_arp* arp = (struct ether_arp*)body;
		return arp;
	}
	return nullptr;
}


void create_arp_request(const raw_socket& socket, in_addr_t target_ip, mac_addr& target_mac, in_addr_t source_ip, mac_addr& source_mac)
{
	struct ether_header eh;
	struct ether_arp arp;
	for (int i = 0; i < 6; i++)
	{
		eh.ether_dhost[i] = target_mac.at(i);
		eh.ether_shost[i] = source_mac.at(i);
	}
	eh.ether_type = htons(ETHERTYPE_ARP);
	arp.arp_hrd = htons(ARPHRD_ETHER);
	arp.arp_pro = htons(ETHERTYPE_IP);
	arp.arp_hln = 6;
	arp.arp_pln = 4;
	arp.arp_op = htons(ARPOP_REQUEST);

	for (int i = 0; i < 6; i++)
	{
		// set source/target mac address
		arp.arp_sha[i] = source_mac.at(i);
		arp.arp_tha[i] = 0;				// Unknown
	}

	for (int i = 0; i < 4; i++)
	{
		// set source ip address
		arp.arp_spa[i] = (source_ip >> i*8) & 0xFF;
		arp.arp_tpa[i] = (target_ip >> i*8) & 0xFF;
	}

	// send arp request packet
	char buf[sizeof(struct ether_header) + sizeof(struct ether_arp)];
	std::memset(buf, 0, sizeof(buf));
	char *p = buf;
	std::memcpy(p, &eh, sizeof(struct ether_header));
	p = p + sizeof(struct ether_header);
	std::memcpy(p, &arp, sizeof(struct ether_arp));
	p = p + sizeof(struct ether_arp);
	int size = p - buf;
	//write(soc, buf, size);
    socket.write_to(buf, size);
}

void export_graph_file(const std::string& filename, const std::vector<std::pair<in_addr_t, mac_addr>>& ips) {

	std::ofstream fs;
  	fs.open("./tmp.diag", std::ios::out);

	fs << "diagram {" << std::endl;
	fs << "LAN [label=\"Local Area Network\"]" << std::endl;

	for(int i = 0; i < ips.size(); i++) {
		std::pair<in_addr_t, mac_addr> pair = ips.at(i);

		fs << "M" << i << "[label=\"" << ip2str(pair.first) << "\\n(" << (pair.second).str() << ")\"]" << std::endl;
	}
	for(int i = 0; i < ips.size(); i++) {
		fs << "LAN -- M" << i << std::endl;
	}
	fs << "}" << std::endl;

	fs.flush();
	fs.close();

	std::system(("blockdiag -o " + filename + " ./tmp.diag").c_str());
	std::cout << "Export " << filename << " Complete!" << std::endl;
}


std::string get_device_name(int argc, char *argv[]) {
	if(argc > 1) {
		return std::string(argv[1]);
	}
	return DEFAULT_NETWORK_INTERFACE;
}

std::string get_output_file(int argc, char *argv[]) {
	if(argc > 2) {
		return std::string(argv[2]);
	}
	return "output.png";
}

int get_check_second(int argc, char *argv[]) {
	if(argc > 3) {
		return std::stoi(std::string(argv[3]));
	}
	return 20;
}

int main(int argc, char *argv[]) {
    
	std::string output_file = get_output_file(argc, argv);
	std::string device_name = get_device_name(argc, argv);
	int checking_time  = get_check_second(argc, argv);

    raw_socket soc(device_name);

    if(!soc.init())
	{
		std::cout << "Usage: ./localarea_search [device_name] [output_file] [wait_seconds]" << std::endl;
		return 0;
	}

    in_addr_t ip_myself = get_ip(soc, device_name);
    mac_addr mac_myself = get_mac_addr(soc, device_name);
    u_int8_t mac_b_raw[] = {0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF};
    mac_addr broad_addr = mac_addr(mac_b_raw);

    std::vector<std::pair< in_addr_t, mac_addr>> ips;

	ips.push_back(std::make_pair(ip_myself, mac_myself));
	
	bool keepThread = true;
	std::thread listenTr([&]{
		soc.listen([&](char (&buffer)[65535], int size){
			if(size <= 0) {
				return keepThread;
			}
			ether_arp* arp = receive_arp_packet(buffer, size);
			if(arp != nullptr && htons( arp->ea_hdr.ar_op ) == 2) {	//reply 
				mac_addr target_mac(arp->arp_sha);
				in_addr_t ipa = (in_addr_t)(arp->arp_spa[0] | arp->arp_spa[1] << 8 | arp->arp_spa[2] << 16 | arp->arp_spa[3] << 24 );
				std::cout << "recv:" << ip2str(ipa) << "/" << target_mac.str() << std::endl;
				if(!target_mac.is_cast_addr() && !target_mac.empty()) {
					ips.push_back(std::make_pair( ipa , target_mac));
				}
			}

			// if return true, keep connection
			return keepThread;
		});
	});

    for(int i = 0; i < MAX_MACHINE_COUNT; i++) {
        in_addr_t ip_target = (ip_myself & 0x00FFFFFF) | (i << 24);
        //std::cout << ip2str(ip_target) << std::endl;
        create_arp_request(soc, ip_target, broad_addr,ip_myself, mac_myself);
		std::this_thread::sleep_for(std::chrono::milliseconds(1));
    }

	std::thread timerTr([&]{
		std::this_thread::sleep_for(std::chrono::seconds(checking_time));
		keepThread = false;
	});


	timerTr.join();
	keepThread = false;	//end listen thread
	soc.end_listen();
    soc.dispose();

    export_graph_file(output_file, ips);
	listenTr.join();

    return 0;
}