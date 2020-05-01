'use strict';

let mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/sandbox', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

let db = mongoose.connection;

db.on('error', function(err){
    console.error('connection error: ' + err);    
});

db.once('open', function(){
    console.log('connected to mongodb succesfully');
    
    //all db communications go here
    let Schema = mongoose.Schema;
    let AnimalSchema = new Schema({
        type: {type: String, default: 'golden fish'},
        size: String,
        color: {type: String, default: 'golden'},
        mass: {type: Number, default: 0.5},
        name: {type: String, default: 'melda'}
    });

    AnimalSchema.pre('save', function(next){
        if (this.mass >= 100) {
            this.size = 'big';
        } else if(this.mass >= 5 && this.mass < 100) {
            this.size = 'medium';
        } else {
            this.size = 'small';
        }
        next();
    });

    AnimalSchema.statics.findSize = function(size, callback){
        //this === Animal
        return this.find({size: size}, callback);
    }

    AnimalSchema.methods.findSameColor = function(callback){
        //this === document
        return this.model('Animal').find({color: this.color}, callback);
    }

    let Animal = mongoose.model('Animal', AnimalSchema);

    let dog = new Animal({
        type: 'Dog',
        color: 'brown',
        mass: 25,
        name: 'snoopy'
    });

    let animal = new Animal({}); //Goldfish

    let whale = new Animal({
        type: 'whale',
        mass: 25000,
        name: 'Fig'
    });

    let animalData = [
        {
            type: 'mouse',
            color: 'gray',
            mass: 0.35,
            name: 'Marvin'
        },
        {
            type: 'nutria',
            color: 'brown',
            mass: 6.35,
            name: 'Gretchen'
        },
        {
            type: 'wolf',
            color: 'gray',
            mass: 35,
            name: 'Iris'
        },
        dog,
        animal,
        whale

    ];

    Animal.deleteMany({}, function(err){
        if(err)  console.error('Error occured ' + err);                 
            Animal.create(animalData, function(err, results){
                if(err)  console.error('Error occured ' + err);
                Animal.findOne({type: 'Dog'}, function(err, results){
                        if(err)  console.error('Error occured ' + err);
                        results.findSameColor(function(err, results){     
                            results.forEach(function(resani){
                                console.log(resani.name + ' the ' + resani.color + ' ' + resani.type + ' is a ' + resani.size + '-sized animal');                                
                            });
                            db.close(function(){
                                console.log('connection to mongodb was closed');            
                            });
                        });
                });
            });  
    });          

});
