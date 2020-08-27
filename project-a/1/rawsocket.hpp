
#ifndef RAWSOCKET_HPP_INCLUDED
#define RAWSOCKET_HPP_INCLUDED

#include<sstream>
#include<string>
#include<cstring>
#include<functional>
#include<iomanip>

#include<unistd.h>
#include<sys/socket.h>
#include<sys/ioctl.h>

#include<net/ethernet.h>
#include<net/if.h>
#include<netinet/ip.h>
#include<netinet/if_ether.h> 
#include<netpacket/packet.h>

#define BUFFER_SIZE 65535


class mac_addr {
    char addr[6];
public:
    mac_addr();
    mac_addr(u_int8_t ptr[6]);
    mac_addr(const mac_addr& mac);
    char at(int index) const;
    void set(char mac[6]);
    bool empty() const;
    bool is_cast_addr() const;
    std::string str() const;

    static mac_addr broad_addr;
};



inline char mac_addr::at(int index) const {
    return addr[index];
}

class raw_socket {
    std::string device_name;
    int socket_ptr;
    bool exit_listen;
public: 
    raw_socket(std::string device_name);
    int get_socket() const;
    bool init();
    ssize_t write_to(char* buf, size_t size) const;
    void listen(std::function<bool(char(&buffer)[BUFFER_SIZE], int)> action);
    void end_listen();
    void dispose();
    ~raw_socket();
};

inline int raw_socket::get_socket() const {
    return this->socket_ptr;
}

std::string ip2str(in_addr_t ip);

#endif