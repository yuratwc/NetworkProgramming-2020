CXX = g++
TARGET = localarea_search
CXXFLAGS = -pthread -std=c++11
SRCS = rawsocket.cpp localarea_search.cpp
OBJS := $(SRCS:.cpp=.o)

$(TARGET): $(OBJS)
	$(CXX) -o $@ $(OBJS) -pthread

clean:
	rm -f $(TARGET) $(OBJS)