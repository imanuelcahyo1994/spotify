const express = require("express");
const app = express();
const dosen = require("./routes/dosen");
const user = require("./routes/user");

app.use(express.json());
app.use("/api/dosen",dosen);
app.use("/api/user",user);
 
app.listen(3000,function()
{
	console.log("Listening On Port 3000...");
});