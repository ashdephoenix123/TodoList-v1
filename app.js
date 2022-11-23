require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')


const app = express();
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: true }))
app.set('view engine', 'ejs');

mongoose.connect(process.env.URI, { useNewUrlParser: true });

const itemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }
});

const Item = mongoose.model('Item', itemSchema);

const item1 = new Item({
    name: "Welcome to your Todo list"
})
const item2 = new Item({
    name: "Add items on the go"
})
const item3 = new Item({
    name: "<--- Check an item"
})

const arr = [item1, item2, item3];



const listSchema = new mongoose.Schema({
    name: String,
    items: [itemSchema]
})

const List = mongoose.model('List', listSchema);


app.route("/")
    .get((req, res) => {
        Item.find({}, (err, foundItems) => {
            if (err) {
                console.log(err);
            } else {
                if (foundItems.length === 0) {
                    Item.insertMany(arr, (err) => {
                        if (err) {
                            console.log(err);
                        }
                    });
                    res.redirect("/");
                } else {
                    res.render("list", { title: "Today", newItem: foundItems })
                }
            }
        })
    })
    .post((req, res) => {
        const listName = req.body.list;
        const addCustomItem = req.body.newTodo;
        const item = new Item({
            name: addCustomItem
        });
        if (listName === "Today") {
            item.save();
            res.redirect("/")
        } else {
            List.findOne({ name: listName }, (err, foundList) => {
                if (err) {
                    console.log(err);
                } else {
                    foundList.items.push(item);
                    foundList.save();
                    res.redirect(`/${foundList.name}`)
                }
            })
        }
    });

app.route("/:customTitle")
    .get((req, res) => {
        const customTitle = req.params.customTitle;
        List.findOne({ name: customTitle }, (err, foundList) => {
            if (err) {
                console.log(err);
            } else {
                if (!foundList) {
                    const list = new List({
                        name: customTitle,
                        items: arr
                    });
                    list.save();
                    res.redirect(`/${customTitle}`)
                } else {
                    
                    res.render("list", { title: foundList.name, newItem: foundList.items })
                }
            }
        })
    });

app.route("/delete")
    .post((req, res) => {
        const id = req.body.checkbox;
        const listName = req.body.titleName;

        if (listName === "Today") {
            Item.findByIdAndRemove(id, (err) => {
                if (err) {
                    console.log(err);
                } else {
                    res.redirect("/");
                }
            })
        } else {
           List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: id}}}, (err, result)=> {
            if(err){
                console.log(err);
            } else {
                res.redirect(`/${listName}`);
            }  
           })
        }
    });
app.listen(3000, () => {
    console.log("server is up and ready in port 3000");
});