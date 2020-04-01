import os
from .classes import channel,message

from flask import Flask,render_template,session,request,redirect,url_for,jsonify
from flask_socketio import SocketIO, emit
from flask_session import Session

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

# Configure session to use filesystem
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

#list of all users
users = []

#list of available channels
channels = []
channelsdict = {}
@app.route("/", methods=["GET","POST"])
def index():
    #logs in user
    if request.method == "POST":
        user = request.form.get('user')

        #checks for users uniqueness
        if user in users:
            return redirect(url_for('index'))

        #adds user in user array
        users.append(user)
        session['user'] = user
        return redirect(url_for('home'))
    elif request.method == 'GET':
        #check whether there is a user logged in
        if 'user' in session:
            return redirect(url_for('home'))
        return render_template("index.html")

@app.route("/home")
def home():
    if 'user' in session:
        user = session['user']
        return render_template("home.html", user=user, channels=channels)
    else:
        return redirect(url_for('index'))

@app.route("/individualmessages")
def indMessages():
    return "hello"

@app.route("/channelname", methods=["POST"])
def channelname():
    if request.form.get('channelName') in channelsdict:
        print(f"NAME TO BE CHECKED:{request.form.get('channelName')}")
        return "invalid"
    print("INFO: no channel with the name exists")
    return 'valid'


@app.route("/channelmessages", methods=["POST"])
def channelmessages():
    channel = request.form.get("channelName")
    print(f"SUCCESS: {channelsdict[f'{channel}'].name}")

    length = len(channelsdict[f'{channel}'].messages)
    print(length)

    messageDic = []
    for message in channelsdict[f'{channel}'].messages:
        messageDic.append({"writer": message.writer, "text": message.text, "date": message.datewritten})

    return jsonify({
    "name": channelsdict[f'{channel}'].name,
    "datecreated": channelsdict[f'{channel}'].datecreated,
    "messages": messageDic
    })

@app.route("/logout")
def logout():
    session.pop('user',None)
    return redirect(url_for('index'))

@socketio.on("create channel")
def createChannel(data):
    print("received the websocket request from the client")
    channelName = data['channel_name']
    print(f"CHANNEL NAME: {data['channel_name']}")

    try:
        #create new channel
        channelObj = channel(channelName,session['user'])
        try:
            channelsdict[f"{channelObj.name}"] = channelObj
            channels.append(channelObj)
            print("SUCCESS: the channel has been added to the array")
        except:
            print("ERROR: the channel has not been added to the array")

        print("SUCCESS: channel has been created")
    except:
        print("ERROR: channel has not been created")

    emit("announce channel", {"channelName":channelObj.name,"datecreated":channelObj.datecreated,"timecreated": channelObj.timecreated}, broadcast=True)
    print(f"CHANNELNAME: {channelObj.name}")
    print("SUCCESS: broadcasted to other users")

@socketio.on("post message")
def createMessage(data):

    #create message object
    content = data["message"]
    messagecontainer = message(writer=session['user'], text=content)

    try:
        #adding the message to the adjacent channel
        channelsdict[data["channelname"]].add_message(messagecontainer)
        if channelsdict.count() >= 100:
            channelsdict.pop(channelsdict[1])
        print("SUCCESS: the message was added to the adjacent channel successfully")
    except:
        print("ERROR: the message was not added to the adjacent channel")

    emit("message", {"message":messagecontainer.text,"writer":messagecontainer.writer, "time":messagecontainer.datewritten}, broadcast=True)
    print("message gotten")

@socketio.on("delete message")
def deleteMessage(data):

    #delete message object
    messageDic = []
    channel = data["channel"]
    timestamp = data["time"]
    messagetext = data["text"]

    messagecontainer = message(writer =session['user'],text = messagetext, time=timestamp)

    print(f'{channelsdict[f"{channel}"].messages}')
    print(f"{timestamp}")
    channelsdict[f"{channel}"].remove_message( messagecontainer )
    print("SUCCESS: you removed the message successfully")


    emit("deleted message", {"messages": "hello"})
