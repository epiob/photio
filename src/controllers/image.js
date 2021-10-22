const path = require('path');
const {randomNumber} = require('../helpers/libs');
const fs = require('fs-extra');
const {Image, Comment} = require('../models');
const md5 = require('md5');

const sidebar = require('../helpers/sidebar');

const ctrl = {};

ctrl.index = async (req, res) => {
    let viewModel = {image: {}, comments: {}};

    let image = await Image.findOne({filename: req.params.image_id});

    image.views += 1 ;
    viewModel.image = image;
    await image.save();

    image = await Image.findOne({filename: req.params.image_id}).lean();
    if(image){
        viewModel.image = image;
        const comments = await Comment.find({image_id: image._id}).lean();
        viewModel.comments = comments;
        viewModel = await sidebar(viewModel);
        //console.log(viewModel);
        res.render('image', viewModel);
    } else {
        res.redirect('/');
    }
    
};

ctrl.create =  (req, res) => {

    const saveImage = async () => {

        const imgURL = randomNumber();
        const images = await Image.find({filename: imgURL});
        if(images.length>0){
            saveImage();
        } else {
            console.log(imgURL);
            const imageTempPath = req.file.path;
            const ext = path.extname(req.file.originalname).toLowerCase();
            const targetPath = path.resolve(`src/public/upload/${imgURL}${ext}`); 

            if (ext === '.png'|| ext === '.jpg' || ext === '.jpeg'|| ext === '.gif') {
                await fs.rename(imageTempPath, targetPath);
                const newIMG = new Image({
                title: req.body.title,
                filename: imgURL+ext,
                description: req.body.description,
                });
                console.log(newIMG);
                const imageSave = await newIMG.save();
                res.redirect('/images/' + imgURL + ext);
                
            } else {
                await fs.unlink(imageTempPath);
                res.status(500).json({error: `Solo puedes subir imagenes!`});
            }
           
        }
        };
    

    saveImage();

};

ctrl.like = async (req, res) => {
    let image = await Image.findOne({filename: req.params.image_id});
    if(image){
        image.likes +=1;
        await image.save();
        res.json({likes: image.likes});
    } else{
        res.status(500).json({error: 'Internal Error'});
    }

};

ctrl.comment = async (req, res) => {
    const image = await Image.findOne({filename: req.params.image_id}).lean();
    if(image){
        const newComment = new Comment(req.body);
        newComment.gravatar = md5(newComment.email);
        newComment.image_id = image._id;
        await newComment.save();
        res.redirect('/images/' + image.filename);
    } else {
        res.redirect('/');
    }
    
    
    

};


ctrl.remove = async (req, res) => {
    const image = await Image.findOne({filename: req.params.image_id});
    if(image){
        await fs.unlink(path.resolve('./src/public/upload/' + image.filename));
        await Comment.deleteOne({image_id: image.id});
        await image.remove();
        res.json(true);
    }
};

module.exports = ctrl;