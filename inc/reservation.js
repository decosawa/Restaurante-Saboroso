var moment = require('moment');

var conn = require("./db.js");
var Pagination = require("./pagination.js");

module.exports = {

    render(req, res, error, success){

        res.render('reservation', {

            title: 'Reserva - Restaurante Saboroso!',
            background: 'images/img_bg_2.jpg',
            h1: 'Reserve uma mesa!',
            body: req.body,
            error,
            success

        });

    },

    saveForm(fields){

        return new Promise((resolve, reject)=>{

            if(fields.date.indexOf('/') > -1){

                fields.date = fields.date.split('/').reverse().join('-');

            }

            let query;
            let params = [

                fields.name,
                fields.email,
                fields.people,
                fields.date,
                fields.time

            ]

            if(parseInt(fields.id)>0){

                query = `
                
                    UPDATE tb_reservations
                    SET
                        name = ?,
                        email = ?,
                        people = ?,
                        date = ?,
                        time = ?
                    WHERE id = ?

                `;

                params.push(fields.id);

            }else{

                query = `

                    INSERT INTO tb_reservations (name, email, people, date, time)
                    VALUES(?, ?, ?, ?, ?)
                    
                `;

            }

            conn.query(query, params, (err, results)=>{

                if(err){

                    reject(err);

                }else{

                    resolve(results);

                }

            });

        });

    },

    getReservations(req){

        let page = req.query.page;
        let start = req.query.start;
        let end = req.query.end;

        return new Promise((resolve, reject)=>{

            if(!page){

                page=1;
    
            }
    
            let params = [];
    
            if(start && end){
    
                params.push(start, end)
    
            }
            let pag = new Pagination(
    
                `SELECT SQL_CALC_FOUND_ROWS * 
                FROM tb_reservations 
                ${(start && end) ? 'WHERE date BETWEEN ? AND ?' : ''}
                ORDER BY date DESC LIMIT ?, ?`, params
    
            );
    
            pag.getPage(page).then(data =>{

                resolve({

                    data,
                    links: pag.getNav(req.query)

                })

            })

        });

    },

    deleteReservation(id){

        return new Promise((resolve, reject) =>{

            conn.query(`
        
                DELETE FROM tb_reservations WHERE id = ?

             `, [

                id

            ], (err, results)=>{

                if(err){

                    reject(err);

                }else{

                    resolve(results);

                }

            });

        });

    },

    charts(req){

        return new Promise((resolve, reject)=>{

            conn.query(`

                SELECT
                    CONCAT(YEAR(date), '-', MONTH(date)) AS date,
                    COUNT(*) AS total,
                    SUM(people)/COUNT(*) AS avg_people
                FROM tb_reservations
                WHERE
                    date BETWEEN ? AND ?
                GROUP BY YEAR(date), MONTH(date)
                ORDER BY YEAR(date) DESC, MONTH(date) DESC;

            `, [
                req.query.start,
                req.query.end
            ], (err, results)=>{

                if (err) { 

                    reject(err); 

                } else { 

                    let months = [];
                    let values = [];

                    results.forEach(row=>{
                        months.push(moment(row.date).format('MMM YYYY'));
                        values.push(row.total);
                    })

                    resolve({
                        months,
                        values
                    });
                }
               
            });

        });


    }


}