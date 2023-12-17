const http = require("http"); 
const path = require("path"); 
const express = require("express"); 
const bodyParser = require("body-parser");
const portNumber = 5001;
require("dotenv").config({ path: path.resolve(__dirname, ".env") })
const app = express();
app.use(express.static('images'));
app.set("views", path.resolve(__dirname, "templates")); 
app.set("view engine", "ejs"); 
app.use(bodyParser.urlencoded({extended:false}));
const databaseAndCollection = {db: "CMSC335DB2", collection:"shoeCollection"};
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = process.env.MONGO_CONNECTION_STRING;


console.log("Web server started and running at http://localhost:" + portNumber);
process.stdout.write("Stop to shutdown the server: ");
process.stdin.setEncoding("utf8"); 

process.stdin.on("readable", () => {
	let dataInput = process.stdin.read();
	let command = dataInput.trim();
    if (command === "stop") {
        console.log("Shutting down the server");
        process.exit(0);
    }else{
        console.log("Invalid command: " + command);
        process.stdout.write("Stop to shutdown the server: ");
    }
    process.stdin.resume();
});

app.get("/", (request, response) => {
    response.render("index");
});
app.get("/findShoe", (request, response) => {
    response.render("findShoe");
});
app.get("/addShoe", (request, response) => {
    response.render("addShoe");
});
app.get("/TossShoe", (request, response) => {
    response.render("deleteAll");
});


app.post("/postDadJoke", (request, response) => {
    getDadJoke(request, response);
});



async function getDadJoke(reqeust, response){
    let config ={
        headers: {
            Accept: "application/json", 
        },
    };
    let a = await fetch("https://icanhazdadjoke.com/", config);
    let b = await a.json();
    let output = "<h1>Here is the dad joke</h1>";
    output+= `<strong> ${b.joke} </strong>`;
    output +="<br><br><a href=/>HOME</a>";
    response.end(output);
}

app.listen(portNumber);
app.post("/postDelete", (request, response) => {
    requestDelete(request, response);
});

async function requestDelete(request, response) {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
    try {
        await client.connect();
        const result = await client.db(databaseAndCollection.db)
            .collection(databaseAndCollection.collection)
            .deleteMany({});
        let output = "<h1>All Shoes from Your Collection are gone :(</h1>"
        output += `Number of shoes removed: ${result.deletedCount}</p>`;
        output += "<br><br><a href=/>HOME</a>";
        response.end(output);
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

app.post("/postShoeApp", (request, response) => {
    const { number, size, color} = request.body;
    let disp =`<img src="jordan${number}${color}.jpg" width="300" height="300" alt=""`;
    let name =`${color} Jordan ${number} in size ${size}`;
    const variables = {
       number: number,
       size: size,
       color: color,
       shoeToDisplay: disp,
       name: name,
   };

   const foo = async () => {
       const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
   try {
       await client.connect();
      
       /* Inserting one student info */
      
       let shoe = { number: number, size: size, color: color};
       await insertShoe(client, databaseAndCollection, shoe);

   } catch (e) {
       console.error(e);
   } finally {
       await client.close();
   }
   }
   foo();
   console.log(disp);
   response.render("processShoe", variables);


   });

   async function insertShoe(client, databaseAndCollection, newShoe) {
    await client.db(databaseAndCollection.db).collection(databaseAndCollection.collection).insertOne(newShoe);
   
      
   }

   app.post("/findShoe", async (request, response) => {
    const { number, size, color } = request.body;
    let name = "";
    let variables1;
    const filter = { number: number, size: size, color: color };
    const variables = {
        number: number,
        size: size,
        color: color,
        name: name,
        shoeToDisplay: "",
    
    };

    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

    try {
        await client.connect();

        const result = await client.db(databaseAndCollection.db)
            .collection(databaseAndCollection.collection)
            .findOne(filter);

        if (result) {
            variables1 = {
            shoeToDisplay: `<img src="jordan${number}${color}.jpg" width="300" height="300" alt=""`,
            name: name = ` You own a ${color} Jordan ${number} in size ${size} !!`,
            };
        } else {
            variables1 = {
                shoeToDisplay:`<img src="drakeNo.jpg" width="300" height="300" alt="" `,
                name: name = `You don't own a ${color} Jordan ${number} in size ${size} !!`,
                };
        }
        console.log(result);
        response.render("processFind", variables1);

    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
});
