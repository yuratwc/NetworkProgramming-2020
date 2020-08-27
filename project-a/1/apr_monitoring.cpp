/*
    apr_monitoring.cpp ( kadai A1 )
    network programming
    bi18027 / yuratwc
*/

#include<iostream>
#include<vector>
#include<fstream>
#include<unordered_map>
#include<chrono>
#include<thread>
#include"rawsocket.hpp"

#define DEFAULT_NETWORK_INTERFACE "eth0"

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

void export_graph_file(const std::string& filename, std::vector<std::pair<in_addr_t, in_addr_t>> list) {
    
    std::ofstream fs;
  	fs.open("./tmp.diag", std::ios::out);


    //extract ip address having once and more communication
    std::vector<in_addr_t> ips;
    for(int i = 0; i < list.size(); i++) {
        ips.push_back(list.at(i).first);
    }


    fs << "seqdiag {" << std::endl;

    for(int i = 0; i < list.size(); i++) {
        fs << "\"" << ip2str(list.at(i).first) << "\"" << " -> " << "\"" << ip2str(list.at(i).second) << "\"" << std::endl;
    }
    fs << "}" << std::endl;
    fs.close();

    std::system(("seqdiag -o " + filename + " ./tmp.diag").c_str());
	std::cout << "Export " << filename << " Complete!" << std::endl;
}

in_addr_t array2ip(u_int8_t ip[4]) {
    return ip[0] | ip[1] << 8 | ip[2] << 16 | ip[3] << 24;
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
    //if the program running on a router...

    std::string networki = get_device_name(argc, argv);
    std::string output_file = get_output_file(argc, argv);
	int checking_time  = get_check_second(argc, argv);

    raw_socket soc(networki);

    if(!soc.init())
	{
		std::cout << "Usage: ./apr_monitoring [device_name] [output_file] [wait_seconds]" << std::endl;
		return 0;
	}

    std::vector<std::pair<in_addr_t, in_addr_t>> list;
	bool keepThread = true;
	std::thread listenTr([&]{
        soc.listen([&](char(&buffer)[BUFFER_SIZE], int size) {
            if(size <= 0) {
                return true;
            }
            ether_arp* arp = receive_arp_packet(buffer, size);

            if(arp == nullptr)
                return true;
            
            int operation = htons(arp->ea_hdr.ar_op);
            if(operation == 1) {    //request
                //arp->arp_spa -> arp->arp_tpa
                list.push_back(std::make_pair(array2ip(arp->arp_spa), array2ip(arp->arp_tpa)));
            } else if(operation == 2) { //reply
                //arp->arp_spa <- arp->arp_tpa
                list.push_back(std::make_pair(array2ip(arp->arp_tpa), array2ip(arp->arp_spa)));
            }
            return true;
        });
    });

    std::thread timerTr([&]{
		std::this_thread::sleep_for(std::chrono::seconds(checking_time));
		keepThread = false;
	});

	timerTr.join();
	keepThread = false;	//end listen thread
	soc.end_listen();
    soc.dispose();


    export_graph_file(output_file, list);
	listenTr.join();

}