//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// Mongoose

mongoose.connect('mongodb+srv://admin-aaron:Betes4lyfe@cluster0.jsnw3j5.mongodb.net/todolistDB');

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item ({
    name: "Item 1"
});

const item2 = new Item ({
  name: "Item 2"
});

const item3 = new Item ({
  name: "Item 3"
});

const baselineItems = [item1,item2,item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);






app.get("/", function(req, res) {
  

  Item.find({},(err,foundItems)=>{
    if (foundItems.length === 0) {
      Item.insertMany(baselineItems, (err)=> {
        if (err){
          console.log(err);
        } else {
          console.log("Successfully inserted items!");
        }
        res.redirect("/");
      });
    } else {
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }

  })

  

});

app.post("/", (req, res)=>{
  const listName = req.body.list;

  const newItem = new Item ({
    name: req.body.newItem
  })

  if (listName==="Today"){
    newItem.save().then(res.redirect("/"));
  } else {
    List.findOne({name: listName}, (err,results) =>{
      if (err){
        console.log(err);
      } else {
        results.items.push(newItem);
        results.save().then(res.redirect("/"+listName));
        
      }
    })
  }


});

app.post("/delete", (req,res)=>{
  const checkedBoxID = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today"){
    Item.findByIdAndRemove(checkedBoxID, (err)=>{
      if (err){
        console.log(err);
      } else {
        console.log("Successfully deleted item!");
      }
    })
  
    res.redirect("/")
  } else {
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedBoxID}}}, (err,results)=>{
      if (err){
        console.log(err);
      } else {
        res.redirect("/"+listName);
      }
    });
  }


});

app.get("/:newList", (req,res)=>{
  const newListName = _.capitalize(req.params.newList);

  List.findOne({name:newListName}, (err,results)=>{
    if (err){
      console.log(err);
    } else {
      if(!results){
        const list = new List({
          name : newListName,
          items : baselineItems
        });
      
        list.save();
        res.redirect("/"+newListName);

      } else {
        res.render("list", {listTitle: results.name, newListItems: results.items});
      }
    }
  })

});

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function() {
  console.log("Server started on port 3000");
});
