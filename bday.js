var Discord = require('discord.js');
var cron = require('node-cron')
var fs = require('fs')
var client = new Discord.Client(); 
var arr = []
var upd = []
var bd = []
var users = []
var double = []
var channels = []
var alreadyRole = []
var remove = []
var x = 0
var isBday = [];
var roleCount = [];
var server = [];
var role = [];
var uprole = [];
var rol;
function editDistance(s1, s2) {
    s1 = String(s1).toLowerCase();
    s2 = String(s2).toLowerCase();
    var costs = new Array();
    for (var i = 0; i <= s1.length; i++) {
      var lastValue = i;
      for (var j = 0; j <= s2.length; j++) {
        if (i == 0)
          costs[j] = j;
        else {
          if (j > 0) {
            var newValue = costs[j - 1];
            if (s1.charAt(i - 1) != s2.charAt(j - 1))
              newValue = Math.min(Math.min(newValue, lastValue),
                costs[j]) + 1;
            costs[j - 1] = lastValue;
            lastValue = newValue;
          }
        }
      }
      if (i > 0)
        costs[s2.length] = lastValue;
    }
    return costs[s2.length];
  }
function similarity(s1, s2) {
    var longer = s1;
    var shorter = s2;
    if (s1.length < s2.length) {
      longer = s2;
      shorter = s1;
    }
    var longerLength = longer.length;
    if (longerLength == 0) {
      return 1.0;
    }
    return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
  }
function search(name, index){
    var possible = []
    var nick = []
    var temp = users
    if(remove.length != 0){
        for(var i = 0; i< remove.length;i++){
            for(var j= 0; j<temp.length;j++){
                if(temp[j] == remove[i]){
                    temp.splice(j,1)
                    break;
                }
            }
        }
    }
    for(var i = 0; i<temp.length;i++){
        var member = server[index].member(temp[i]);
        var nickname = member ? member.displayName : null;
        nickname = String(nickname).replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");
        nickname = String(nickname).replace(/\s{2,}/g," ");
        nickname = String(nickname).toLowerCase()
        name = String(name).toLowerCase()
        if(nickname.includes(name.substring(0, name.indexOf(" ")))){
            possible.push(users[i])
            nick.push(nickname)
        }
        else if(nickname.includes(name.substring(name.indexOf(" ")+1))){
            possible.push(users[i])
            nick.push(nickname)
        }
    }
    var per = 0
    var n;
    var him
    for(var i = 0; i< possible.length;i++){
        if(nick[i].includes(name.substring(name.indexOf("/")+1))){
            n = possible[i]
            him = nick[i]
            per = 1
            break;
        }
        else if(similarity(name, nick[i])>per){
            per = similarity(name,nick[i])
            him =nick[i]
            n = possible[i]
        }
    } 
    if(per == 0){ 
        console.error("Name not found")
        return null
    }
    else{
        for(var i = 0; i<double.length;i++){
            double[i] = String(double[i]).toLowerCase()
            if(double[i]==name.substring(0,name.indexOf("/"))){
                var matches = him.match(/\d+/g);
                if (matches == null) {
                    console.error("Same Name; No ID Number")
                    remove.push(n)
                    return search(name,index)
                }
                else{
                  if(!him.includes(name.substring(name.indexOf("/")+1))){
                      console.error("Wrong ID")
                      remove.push(n)
                      return search(name,index)
                  }  
                }
            }
        } 
        for(var i = 0; i<alreadyRole.length;i++){
            if(alreadyRole[i] == n){
                console.error("Already has Role");
                remove.push(n)
                return search(name,index)
            }
        }
        alreadyRole.push(n)
        console.log("Found-" + him)
        return n
    }
}
function read(){
    try{
        var data = fs.readFileSync('read.txt')
        var read = data.toString()
       arr = read.split(",")
       arr.splice(arr.length-1,1)
       for(var i = 0;i<arr.length;i++){
            var name = arr[i].substring(0,arr[i].indexOf("*"))
            var id = arr[i].substring(arr[i].indexOf("^")+1)
                for(var j =i+1;j<arr.length;j++){
                    var nome = arr[j].substring(0,arr[j].indexOf("*"))
                    var ide = arr[j].substring(arr[j].indexOf("^")+1)
                    if((id == ide)||(ide.match(/[^0-9]/))){
                        arr.splice(j,1)
                    }
                    else if(name == nome){
                        double.push(name);
                        break;
                    }
                    
            }
        }
    }
    catch(err){
        console.error(err)
    }
}
function getUsers(){
    users = []
    for(var i = 0; i< server.length;i++){
        server[i].members.cache.forEach(member => users.push(member.user));
    }
    for(var i = 0; i<users.length-1;i++){
        for(var j = i+1; j< users.length;j++){
            if(users[i]==users[j]){
                users.splice(j,1)
            }
        }
    }
}
function update(){
    var recent = []
    var recentName = []
    remove = []
    for(var i = 0; i< uprole.length;i++){
        uprole[i].edit({
            name: "Upcoming Bday:"
        })
    }
    upd = [];
    bd = [];
    var tmem;
    var date = new Date();
    var count = 0;
    for(var i = 0; i< server.length;i++){
        roleCount[i] = 0
        isBday[i] = false
    }
    getUsers()
    for(var i = 0; i< users.length;i++){ 
        for(var j = 0; j<server.length;j++){
            var member = server[j].member(users[i])
            if(member!=null){
                member.roles.remove(role[j])
                member.roles.remove(uprole[j])
            }
        }
    }
    for(var d of arr){
        var mon = parseInt(d.substring(d.indexOf("*")+1, d.indexOf("!") ))
        var day = parseInt(d.substring(d.indexOf("!")+1, d.indexOf("@") ))
        var year = parseInt(d.substring(d.indexOf("@")+1, d.indexOf("#") ))
        var age = d.substring(d.indexOf("#")+1, d.indexOf("^"))
        var id = d.substring(d.indexOf("^")+1)
        var name = d.substring(0,d.indexOf("*"))
        var bday = new Date(year, mon, day)
        console.log(name)
        if((date.getMonth()==mon)&&(date.getDate()==day)){
           for(var i =0 ; i< channels.length;i++){
               channels[i].send("Happy " + age + "th Birthday " + name + "!!!!:balloon::birthday::confetti_ball:")
            }
            var say = "It is " + name + "'s " + age + "th birthday today"
            for(var i = 0; i< server.length;i++){
                getUsers()
                console.log("Birthday on Server[" + i+ "]: ")
                var member = server[i].member(search(name+"/"+id, i));
                if(member != null){
                    isBday[i] = true;
                    member.roles.add(role[i])
                    tmem  = member
                } 
                alreadyRole = []
                remove = []     
            }
            if(tmem != null){
                tmem.send("From Dr. Neat and the entire Computer Science class, Happy Birthday!")
            }
            bd.push(say)
        }
        else{
            if(count<=4){
                var here = name + " " + bday.toDateString().substring(0,15) + "\n"
                upd.push(here)
                count++
            }
            for(var i = 0; i< server.length;i++){
                getUsers()
            if(roleCount[i] ==0){
                console.log("Upcoming on Server["+i+"]: ")
                var member = server[i].member(search(name+"/"+id, i));
                if(member != null){
                    recent[i] = new Date(year, mon, day)
                    recentName[i] = name
                    uprole[i].edit({
                    name: "Upcoming Bday-" + bday.toDateString().substring(0,10)
                    })
                    member.roles.add(uprole[i])
                    roleCount[i]++; 
                }   
            }
            else{  
                console.log("Upcoming on Server["+i+"]: ")
                if((recent[i].getMonth()==mon)&&(recent[i].getDate()==day)){
                    var member = server[i].member(search(name+"/"+id,i));
                    if(member != null){
                        member.roles.add(uprole[i])
                        roleCount[i]++;
                    }     
                }
                else{
                    console.log("Later than: " + recentName[i] + " " + recent[i])
                }
            }
            remove = []
            alreadyRole = []
            }
        }
       
    }
    for(var i = 0; i< isBday.length;i++){
        if(isBday[i]){
            for(var j = 0; j<users.length;j++){
                var member = server[i].member(users[i])
                if(member!=null){
                    member.roles.remove(uprole[i])
                }
            }
        }
    }
    
}

function makeRole(){
    server.roles.create({
        data: {
          name: "Happy Birthday:",
          color: 'BLUE',
          permissions: []
        }
      })
      server = client.guilds.cache.get(server.id)
      rol= server.roles.cache.find(r => r.name == "Happy Birthday:") 
      role = server.roles.cache.get(rol.id)

}
function readRole(){
    rol= server.roles.cache.find(r => r.name == "Happy Birthday:") 
    role = server.roles.cache.get(rol.id)
}
client.on('ready', ()=>{
    console.log(`Logged in as ${client.user.tag}!`);
    client.guilds.cache.forEach(s => server.push(s))
    for(var i = 0; i< server.length;i++){
        isBday.push(false)
        channels.push(server[i].channels.cache.find(c => c.name.includes("announcements")))
        rol = server[i].roles.cache.find(r => r.name.includes("Happy Birthday"))
        if(!rol){
            //makeRole()
            //readRole()
            role.push(null)
            console.log("Role not found")
        }
        else{
            role.push(server[i].roles.cache.get(rol.id))
        }
        rol= server[i].roles.cache.find(r => r.name.includes("Upcoming Bday"))
        if(!rol){
            //makeRole()
            //readRole()
            uprole.push(null)
            console.log("Role not found")
        }
        else{
            uprole.push(server[i].roles.cache.get(rol.id))
        }
    }
    getUsers()
    read();
    update();
 });

 var p = cron.schedule("0 8 * * *", function(){
    update();
  });

  var m = cron.schedule("1 0 * * *", function(){
    read();
  });

client.on('message', msg => {
    if(msg.content.substring(0,1) == "`"){
        var reply =""
        if(msg.content =='`upcoming'){
            if(upd.length > 0 ){
                for(var d of upd){
                        reply = reply + d
                }
            }
            else{
                reply = "There are no upcoming birthdays"
            }
        }
        else if(msg.content == '`bday'){
            if(bd.length>0){
                for(var d of bd){
                    reply = reply+d
                }
            }
            else{
                reply = "There are no birthdays today"
            }
        }
        else{
            reply = "Sorry that is not a command"
        }
        msg.channel.send(reply)
    }
});

client.login('')
