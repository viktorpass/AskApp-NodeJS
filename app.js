const bodyParser = require('body-parser');
const express =  require('express');
const app = express();
const port = 3000;
const ConnectionDB = require('./databases/Database');
const Question = require('./databases/Questions');
const Answer = require('./databases/Answers'); 


ConnectionDB.authenticate().then(()=>{
    console.log("Database connected");
}).catch((err)=>{
    console.log(err);
})

app.set('view engine','ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

app.get('/',(req,res)=>{
    Question.findAll({raw:true,order:[['id','DESC']]}).then((questions)=>{
        res.render('index',{questions:questions});
    })
    
});
app.get('/ask',(req,res)=>{
    res.render('ask');
});
app.get('/question/:id',(req,res)=>{
    let id = req.params.id;
    Question.findOne({
        where:{id:id}
    }).then((question)=>{
        if(question){
            Answer.findAll({
                where:{questionId:question.id}
            }).then((answers)=>{
                res.render("question",{
                    question:question,
                    answers:answers
                });
            })
        }else{
            res.redirect('/');
        }
    })
})


app.post('/saveQuestion',(req,res)=>{
    let title = req.body.title;
    let description = req.body.description;
    Question.create({
        title:title,
        description:description
    }).then(()=>{
        res.redirect('/');
    }).catch((err)=>{
        res.send(err);
    })
});
app.post('/answer',(req,res)=>{
    let bodyArea = req.body.bodyArea;
    let questionId = req.body.questionId;

    Answer.create({
        bodyArea:bodyArea,
        questionId:questionId
    }).then(()=>{
        res.redirect("/question/"+ questionId);
    }).catch((err)=>{
        res.redirect('/');
    });

})




app.listen(port,(req,res)=>{
    console.log("Server is listening at port "+ port);
});