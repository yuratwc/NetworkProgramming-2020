#include "rawsocket.hpp"

mac_addr::mac_addr() {}

mac_addr::mac_addr(u_int8_t ptr[6]) {
    for(int i = 0; i < 6; i++) {
        addr[i] = (char)ptr[i];
    }
}

mac_addr::mac_addr(const mac_addr& mac) {
    for(int i = 0; i < 6; i++)
        addr[i] = mac.addr[i];
}

void mac_addr::set(char mac[6]) {
    for(int i = 0; i < 6; i++)
        addr[i] = mac[i];
}

bool mac_addr::empty() const {
    for(int i = 0; i < 6; i++)
        if(addr[i] != 0)
            return false;
    return true;
}

bool mac_addr::is_cast_addr() const {
    for(int i = 0; i < 6; i++)
        if(addr[i] != 0xFF)
            return false;
    return true;
}

std::string mac_addr::str() const {
    std::stringstream ss;
    for (int i = 0; i < 6; i++) {
        int nm = addr[i] & 0xFF;
        ss << std::hex << std::setw(2) << std::setfill('0') << nm;
        if(i != 5) {
            ss << ':';
        }
    }
    return ss.str();
}

raw_socket::raw_socket(std::string device_name) : socket_ptr(-1), device_name(device_name) {}


bool raw_socket::init() {
    this->socket_ptr = socket(PF_PACKET, SOCK_RAW, htons(ETH_P_ALL));
    if(this->socket_ptr < 0) {
        perror("create-socket");
        return false;
    }
    struct ifreq ifr;
    const char* device_chars = this->device_name.c_str();
    std::strncpy(ifr.ifr_name, device_chars, sizeof( ifr.ifr_name)-1);
    if (ioctl(socket_ptr, SIOCGIFINDEX, &ifr) == -1) { 
        perror("get-socket-info");
        return false;
    }

    //std::cout<<"socket-id:"<<this->socket_ptr<<"/"<<device_name<<std::endl;
    struct packet_mreq mreq;
    std::memset(&mreq, 0, sizeof(mreq));
    mreq.mr_type = PACKET_MR_PROMISC;
    mreq.mr_ifindex = ifr.ifr_ifindex;
    if ((setsockopt(this->socket_ptr, SOL_PACKET, PACKET_ADD_MEMBERSHIP, (void *)&mreq, sizeof(mreq))) < 0)
    {
        perror("setsockopt");
        return false;
    }

    struct sockaddr_ll sa;
    std::memset(&sa, 0, sizeof(sa));
    sa.sll_family = PF_PACKET;
    sa.sll_protocol = htons(ETH_P_ALL);
    sa.sll_ifindex = ifr.ifr_ifindex;

    int binded = bind(this->socket_ptr, (struct sockaddr *)&sa, sizeof(sa));
    if (binded == -1) {
        perror("socket-bind");
        close(this->socket_ptr);
        return false;
    }
    return true;
}

ssize_t raw_socket::write_to(char* buf, size_t size) const {
    return write(this->socket_ptr, buf, size);
}

void raw_socket::listen(std::function<bool(char(&buffer)[BUFFER_SIZE], int)> action) {
    //void (*const action)(char(&buffer)[BUFFER_SIZE], size_t)
    int size = 0;
    char buf[BUFFER_SIZE];

    ioctl(this->socket_ptr, FIONBIO, 1);    //set non-blocking mode

    while(this->socket_ptr != -1 && !this->exit_listen) {
        if((size = read(this->socket_ptr, buf, sizeof(buf))) < 0) {
            if(errno != EAGAIN) {
                if(this->exit_listen) {
                    break;
                }
                perror("listen socket");
            }
        }

        if(!action(buf, size)) 
            break;
    }
    this->exit_listen = false;
}

void raw_socket::end_listen() {
    this->exit_listen = true;
}
void raw_socket::dispose() {
    if(this->socket_ptr != -1) {
        int ptr = this->socket_ptr;

        this->socket_ptr = -1;
        shutdown(ptr, 2);

        close(ptr);
    }
}

raw_socket::~raw_socket() {
    if(this->socket_ptr != -1)
        this->dispose();
}
    
std::string ip2str(in_addr_t ip) {
    std::stringstream ss;

    for(int i = 0; i < 4; i++) {
        ss << ((ip >> (8 * i)) & 0xFF);
        if(i != 3) {
            ss << '.';
        }
    }

    return ss.str();
}