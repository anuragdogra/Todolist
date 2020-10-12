const express=require("express");
const bodyParser=require("body-parser");
const mongoose =require("mongoose");
const _=require("lodash");
const app=express();
//const PORT=process.env.PORT || 8080;
//var items=["buy colors","shopping","video games"];
//var workitems=[];
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
const MONGODB_URI='mongodb+srv://anurag:anurag@todolistdb-qohv9.mongodb.net/test?retryWrites=true&w=majority'
mongoose.connect(MONGODB_URI || 'mongodb://localhost/todolistDB',{useUnifiedTopology:true,useNewUrlParser:true});
mongoose.connection.on('connected', function() {
   console.log("connected");
});
const itemsSchema = {
   name:String
};
const Item= mongoose.model("Item",itemsSchema);
const Item1=new Item({
   name:"welcome"
}) ;
const defaultItems=[Item1];
const listschema={
   name:String,
   items:[itemsSchema]
};
const List=mongoose.model("List",listschema);
app.get("/", function(req,res){
   Item.find({},function(err,founditems){
      if(founditems.length === 0)
       {
          Item.insertMany(defaultItems,function(err){
   if(err){
      console.log(err);
   }else {
       console.log("successfull");
     }
  });
    res.redirect("/");
       }
       else{   
      res.render("list", {kindofday:"today", newlistitem:founditems});
       }
   });
   


});
app.get("/:customListName",function(req,res){
   const customListName= _.capitalize(req.params.customListName);
   List.findOne({name:customListName},function(err,foundList){
      if(!err)
      {
         if(!foundList)
         {
            const list=new List({//create a list
               name:customListName,
               items:defaultItems
            });
            list.save();
            res.redirect("/"+customListName);
         }else{
            res.render("list", {kindofday:foundList.name, newlistitem:foundList.items});

         }
      }
   });
  
});
app.post("/",function(req,res){
   const itemName = req.body.newitem;
   const listname=req.body.list;
   const item = new Item({
      name:itemName
   })
   if(listname === "today")
   {
      item.save();
      res.redirect("/");
   } else{
          List.findOne({name:listname},function(err,foundList){
             foundList.items.push(item);
             foundList.save();
             res.redirect("/" + listname);
          });
   }
});
app.post("/delete",function(req,res){
   const checkid=req.body.checkbox;
   const listname=req.body.listname;
      List.findOneAndUpdate({name:listname},{$pull:{items:{_id:checkid}}},function(err,foundList){
         if(!err)
         {
            res.redirect("/" + listname);
         }
      }); 
   
});
let port =process.env.PORT;
if(port == null || port == "")
{
   port=3027;
}

app.listen(port,function(){
console.log("server started");
});
