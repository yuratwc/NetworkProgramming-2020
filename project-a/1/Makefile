CXX = g++
TARGET = apr_monitoring
CXXFLAGS = -pthread -std=c++11
SRCS = rawsocket.cpp apr_monitoring.cpp
OBJS := $(SRCS:.cpp=.o)

$(TARGET): $(OBJS)
	$(CXX) -o $@ $(OBJS) -pthread

clean:
	rm -f $(TARGET) $(OBJS)