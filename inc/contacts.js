var conn = require('./db.js');

module.exports = {

    render(req, res, error, success){

        res.render('contact', {

            title: 'Contato - Restaurante Saboroso!',
            background: 'images/img_bg_3.jpg',
            h1: 'Diga um oi!',
            body: req.body,
            error,
            success
        
        });

    }, 

    saveForm(fields){

        return new Promise((resolve, reject)=>{

            conn.query(`
            
                INSERT INTO tb_contacts (name, email, message)
                VALUES(?, ?, ?)
            
            `, [

                fields.name,
                fields.email,
                fields.message

            ], (err, results)=>{

                if(err){

                    reject(err);
                    
                }
                else{

                    resolve(results);

                }

            });

        });

    },

    getContacts(){

        return new Promise((resolve,reject)=>{

            conn.query(`SELECT * FROM tb_contacts ORDER BY register DESC`, (err, results)=>{

                if(err){

                    reject(err);

                }else{

                    resolve(results);

                }

            });

        });

    },

    deleteContact(id){

        return new Promise((resolve, reject)=>{

            conn.query(`
            
                DELETE FROM tb_contacts WHERE id = ?

            `,[

                id

            ], (err,results)=>{

                if(err){

                    reject(err);

                }else{

                    resolve(results);                    

                }

            });

        });

    }


}