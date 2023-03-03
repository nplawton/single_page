'use strict';

//Dependency Library Setup
const fs = require('fs');

const ex = require('express');
const app = ex();

const cors = require('cors');
app.use(cors({origin: '*'}));

const {Pool} = require('pg');

const bodyParser = require('body-parser');
const { Console } = require('console');
const { get } = require('http');
app.use(bodyParser.json());

//port that Express will listen to for requests
const port = process.env.PORT || 8000;

//use DATABASE_HOST environmental variable if it exists (set by docker compose),
//or default to localhost if no value is set (run outside docker)
const DB_HOST = process.env.DATABASE_HOST || 'localhost';

const pool = new Pool ({
    user: "postgres",
    host: DB_HOST,
    database: "monster",
    password: "password",
    port: 5432
});


/*
    I: Your next task is to create a RESTful Express HTTP server called 
        restfulExpressServer.js to handle the create, update, and destroy HTTP 
        commands. The route handlers must translate their respective command into 
        an appropriate  action that manages the records in the database. Once the
        database  action is complete, the route handlers must send back an
        appropriate HTTP response.
    O: Information from data base, usage information or state error Usage
    C: Only allow CRUD functionality
    E: 
*/

//console.log("hi");

app.get('/monster', (req, res, next) => {
    
    pool.query('SELECT * FROM monsters', (err, results) => {
        if(err){
            return next(err);
        }
    
        let row = results.rows;
        console.log(row);
        res.send(row);
    })

});

app.get('/monster/:id/', (req, res, next) => {

    const id = Number.parseInt(req.params.id);
    console.log(id);

    if(!Number.isInteger(id)){
        res.status(404).send('We don\'t have a record of this creature');
    }

    pool.query('SELECT name, type, hp, xp, attack, description FROM monsters WHERE id = $1', [id], (err, results) => {
        if(err){
            return next(err);
        }

        const creature = results.rows[0];
        console.log('Single monster requested', creature);

        if(creature){
            return res.send(creature);
        }else{
            return res.status(404).send("No creature was found");
        }

    });

});

// app.get('/monster/:id/faction', (req, res, next) => {

//     const id =Number.parseInt(req.params.id);
//     console.log(id);

//     if(!Number.isInteger(id)){
//         res.status(404).send('We don\'t have a record of this creature');
//     }

//     pool.query('SELECT faction_id FROM monsters WHERE id = $1', [id], (err, results) => {
//         if (err){
//             return next(err);
//         }

//         const faction = results.rows[0];
//         console.log(faction);

//         pool.query('SELECT * FROM factions WHERE faction = $1', [faction], (err, data) => {
            
//             if(err){
//                 return next(err);
//             }
            
//             const factionDetail = data.rows[0];
//             console.log(factionDetail);
//         });

//     })

// });


app.post('/monster', (req, res, next) => {

    const {name, type, attack, description} = req.body;
    const faction_id = Number.parseInt(req.body.faction_id);
    const hp = Number.parseInt(req.body.hp);
    const xp = Number.parseInt(req.body.xp);

    let newCreature = (faction_id, name, type,  hp, xp, attack, description);
    console.log(`New creature was add with faction 
                ${faction_id}, name ${name}, a ${type}, with ${hp} health, 
                    and ${xp} xp, can do ${attack}, ${description}`);

    if(!Number.isNaN(faction_id) && name && type && !Number.isNaN(hp) && !Number.isNaN(xp) && attack && description){
        //console.log("hi");
        pool.query('INSERT INTO monsters (faction_id, name, type, hp, xp, attack, description) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *', 
            [faction_id, name, type, hp, xp, attack, description], (err, results) => {
                const newCreature = results.rows[0];
                console.log('New Creature was created', newCreature);

                if(newCreature){
                    return res.send(newCreature);
                }else{
                    return next(err);
                }

            });
    }else{
        return res.status(400).send("Unable to create creature recheck information and try again");
    }

});

app.patch('/monster/:id', (req, res, next) => {

    const id = Number.parseInt(req.params.id);
    //console.log(id);

    const {name, type, attack, description} = req.body;
    const faction_id = Number.parseInt(req.body.faction_id);
    const hp = Number.parseInt(req.body.hp);
    const xp = Number.parseInt(req.body.xp);

    if(!Number.isInteger(id)){
        res.status(404).send("No creature was found with that ID in the database");
    }

    //check to make sure that the ID is number and send message
    console.log("Creature ID: ", id);

    pool.query("SELECT * FROM monsters WHERE id = $1", [id], (err, results) => {
        if (err){
            return next(err);
        }
    })

});

app.listen(port, () => {
    console.log('listening on port', port);
});

app.use((err, req, res, next) => {
    console.error('We\'re not here right now');
    console.error(err.slack);
    res.sendStatus(404);
});

module.exports = app;