document.addEventListener('DOMContentLoaded',()=>{

  // soccet instance
  var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

  function delfunc(e){
    xpos = e.clientX;
    ypos = e.clientY;
    obj = this;

    //set the position of the element to the point the of cursor
    document.querySelector('#delete-notification').style.top = ypos+"px";
    document.querySelector('#delete-notification').style.left = xpos+"px";
    document.querySelector('#delete-notification').style.display = "block";

    //when no btn is clicked
    document.querySelector('#no').onclick = ()=>{document.querySelector('#delete-notification').style.display = "none"};

    //when yes btn is clicked
    document.querySelector('#yes').onclick = ()=>{
      document.querySelector('#delete-notification').style.display = "none";


      if(localStorage.getItem('user')){
        socket.emit('delete message',{'channel': document.querySelector('#message-title').dataset.channelname,"time": this.dataset.time, "text": this.dataset.text});
        console.log('success: deletion request was a success');

        socket.on('deleted message',data =>{
          console.log("hello world");
        });
      }
    };

  }
  function channelStore(e){
    //stores the message title
    localStorage.setItem("channelname",`${e}`);
  }

  //the channel form is invisible by default
  document.querySelector('#channelform').style.display = "none";


  //shows form when clicked on
  document.querySelector('#create_channel').onclick = ()=>{
    document.querySelector('#channelform').style.display = "block";
  };

  //sets the messagebody to default

  if(localStorage.getItem('channelname')){
    //makes an ajax request of the messages in the specified channel
    let xmlobj = new XMLHttpRequest();
    xmlobj.open('POST','/channelmessages');
    xmlobj.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xmlobj.send(`channelName=${localStorage.getItem('channelname')}`);

    //handles the server response
    xmlobj.onreadystatechange = () =>{
      if(xmlobj.readyState == 4 && xmlobj.status == 200){
        let response =JSON.parse(xmlobj.responseText);
        //sets the messagebody to default
        document.querySelector('#message-title').style.display = "block";
        document.querySelector('#message-body').style.display = "block";

        //sets the message title
        document.querySelector('#message-title').innerHTML = `${response.name}<span style="font-size: 15px; color: grey;"> created on: ${response.datecreated} <//span>`;
        document.querySelector('#post-message').dataset.channelname = response.name;

        //sets the messages if there is any
        const template = Handlebars.compile(document.querySelector('#message').innerHTML);


        for(var i = 0; i < response.messages.length; i++){
          //sets deletion listener

          const content = template({writer: response.messages[i].writer, message: response.messages[i].text, time:response.messages[i].date});
          document.querySelector('#message-list').innerHTML += content;
        }


        //sets the message textarea to blank(default)
        document.querySelector('#messageText').value = '';

      }
    };
  }else{
    document.querySelector('#message-title').style.display = "none";
    document.querySelector('#message-body').style.display = "none";
  }


  //sets the on click listener for channels by default
  let joinbtn = document.querySelectorAll('.joinbtn');
  joinbtn.forEach((button) => {
    button.onclick = ()=>{
      //extracts the name of the channel that has been clicked
      let channelname = button.dataset.channel;
      document.querySelector('#message-list').innerHTML = '';
      channelStore(channelname);

      //makes an ajax request of the messages in the specified channel
      let xmlobj = new XMLHttpRequest();
      xmlobj.open('POST','/channelmessages');
      xmlobj.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
      xmlobj.send(`channelName=${channelname}`);

      //handles the server response
      xmlobj.onreadystatechange = () =>{
        if(xmlobj.readyState == 4 && xmlobj.status == 200){
          let response =JSON.parse(xmlobj.responseText);
          //sets the messagebody to default
          document.querySelector('#message-title').style.display = "block";
          document.querySelector('#message-body').style.display = "block";

          //sets the message title
          document.querySelector('#message-title').innerHTML = `${response.name}<span style="font-size: 15px; color: grey;"> created on: ${response.datecreated} <//span>`;
          document.querySelector('#post-message').dataset.channelname = response.name;

          //sets the messages if there is any
          const template = Handlebars.compile(document.querySelector('#message').innerHTML);


          for(var i = 0; i < response.messages.length; i++){
            //sets deletion listener
            const content = template({writer: response.messages[i].writer, message: response.messages[i].text, time:response.messages[i].date});
            document.querySelector('#message-list').innerHTML += content;
          }


          //sets the message textarea to blank(default)
          document.querySelector('#messageText').value = '';
        }
      };
    };
  });

  //disables channel creation button
  document.querySelector('#submit').disabled = true;
  document.querySelector('#channel-name').value = '';

  //enables channel creation button if a text is entered
  document.querySelector('#channel-name').onkeydown = function(){
    if(document.querySelector('#channel-name').value == ''){
      document.querySelector('#submit').disabled = true;
    }
    else{
      document.querySelector('#submit').disabled = false;
    }
  };

  //opens sockets
  socket.on('connect', ()=>{
    document.querySelector('#submit').onclick = addChannel;
    document.querySelector('#post-message').onclick = postMessage;
  });


  //recieve new channel
  socket.on('announce channel',data =>{
    const template = Handlebars.compile(document.querySelector('#result').innerHTML);
    const content = template({channel_name: data.channelName, date: data.datecreated, time: data.timecreated});
    document.querySelector('#channel-list').innerHTML += content;
    let joinbtn = document.querySelectorAll('.joinbtn');
    joinbtn.forEach((button) => {
      button.onclick = ()=>{
        //extracts the name of the channel that has been clicked
        let channelname = button.dataset.channel;
        document.querySelector('#message-list').innerHTML = '';

        //makes an ajax request of the messages in the specified channel
        let xmlobj = new XMLHttpRequest();
        xmlobj.open('POST','/channelmessages');
        xmlobj.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xmlobj.send(`channelName=${channelname}`);

        //handles the server response
        xmlobj.onreadystatechange = () =>{
          if(xmlobj.readyState == 4 && xmlobj.status == 200){
            let response =JSON.parse(xmlobj.responseText);
            //sets the messagebody to default
            document.querySelector('#message-title').style.display = "block";
            document.querySelector('#message-body').style.display = "block";

            //sets the message title
            document.querySelector('#message-title').innerHTML = `${response.name}<span style="font-size: 15px; color: grey;"> created on: ${response.datecreated} <//span>`;
            document.querySelector('#message-title').dataset.channelname = response.name;
            document.querySelector('#post-message').dataset.channelname = response.name;

            //sets the messages if there is any
            const template = Handlebars.compile(document.querySelector('#message').innerHTML);

            for(var i = 0; i < response.messages.length; i++){
              const content = template({writer: response.messages[i].writer, message: response.messages[i].text, time:response.messages[i].date});
              document.querySelector('#message-list').innerHTML += content;
            }

            document.querySelectorAll('.actual-messages').forEach((item) => {
              item.onclick = delfunc;
            });



            //sets the message textarea to blank(default)
            document.querySelector('#messageText').value = '';

          }
        };
      };
    });
  });

  //recieve new message
  socket.on('message', data =>{
    const message = data.message;

    //create message template and add data onto it
    const template = Handlebars.compile(document.querySelector('#message').innerHTML);
    const content = template({writer: data.writer, message: data.message, time:data.time});
    document.querySelector('#message-list').innerHTML += content;
  });

  //addChannel function
  function addChannel(){
      //channel name entered by the users
      let channelname = document.querySelector('#channel-name').value;

      //ajax object
      let xmlobj = new XMLHttpRequest();
      xmlobj.open('POST','/channelname');
      xmlobj.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
      xmlobj.send(`channelName=${channelname}`);


      xmlobj.onreadystatechange = ()=>{
        if(xmlobj.readyState == 4){
          let response = xmlobj.responseText;
          if(response == 'valid'){
            socket.emit('create channel',{'channel_name':channelname});
          }else{
            var timer = 2;
            setInterval(counter,500);
            document.querySelector('#channel-alert').style.display="block";

            function counter(){
              if(timer == 0){
                document.querySelector('#channel-alert').style.display="none";
              }
              timer = timer -1;
            }
          }
        }
        else{
          console.log("ERROR: three way handshake was not finished");
        }
      };
    document.querySelector('#channel-name').value = '';
    document.querySelector('#submit').disabled = true;
    document.querySelector('#channelform').style.display = "none";
  }

  //addpostchannel function
  function postMessage(){
    const message = document.querySelector('#messageText').value;

    document.querySelector('#messageText').value = '';
    socket.emit('post message',{'message':message,'channelname': document.querySelector('#post-message').dataset.channelname});

    document.querySelectorAll('.actual-messages').forEach((item) => {
      item.onclick = delfunc;
    });
  }
});
