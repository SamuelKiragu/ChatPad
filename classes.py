import datetime

class channel:
    members = {}
    def __init__(self,name,creator):
        self.name = name
        self.members[f"self.creator"] = creator
        self.messages = []
        self.fulldate = datetime.datetime.now()
        self.datecreated = self.fulldate.strftime("%d %b %Y")
        self.timecreated = self.fulldate.strftime("%X")

    def add_message(self, message):
        self.messages.append(message)
        print("added message to channel")

    def remove_message(self,message):
        self.messages.remove(message)
        print("removed the message successfully")


class message:
    fulldate = datetime.datetime.now()
    def __init__(self,writer,text,time = fulldate.strftime("%X")):
        self.writer = writer
        self.text = text
        self.datewritten = time

def main():

    #test whether channel is working
    channel1 = channel("channel1","Kiragu")
    print(channel1.name)
    print(channel1.members)
    print(channel1.datecreated)
    print(channel1.timecreated)


    #test whether message is working
    message1 = message("Kiragu","Hey hello to this channel")
    print(message1.writer)
    print(message1.text)
    print(message1.datewritten)

    #test of adding message to channel
    channel1.add_message(message1)

    #test of removing message from channel
    channel1.remove_message(message("Kiragu","Hey hello to this channel",message1.datewritten))

if __name__ == "__main__":
    main()
