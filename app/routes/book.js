const express = require('express');
const router = express.Router();
const helper = require('../helpers/helper');
const uuid = require('uuid');
const nodemailer = require('nodemailer');

// require DATABASE
const DB = require('../models/db');

router.post("/addTicket", function (req, res, next) {
    var params = req.body;
    var str = params.ma_ghe;
    var arr = str.split(";");
    var id = uuid.v4();
    console.log(req.session.user.id);
    console.log(id);
    console.log(params.id_sc);
    DB.pool.query('INSERT INTO public."datcho"(id,id_user,id_sc,createAt,tong_tien) VALUES ($1, $2,$3, CURRENT_DATE, $4)', [id, req.session.user.id, params.id_sc, params.tong_tien], (err, datcho) => {
        if(err)
        {
            console.log(err);
        }
    })
    arr.forEach(function (item) {
        if (item != "") {
            var i = item.split("");
            var ma = ["0", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "X", "Y", "Z"];
            for (var j = 1; j < ma.length; j++) {
                if (ma[j] == i[0]) {
                    i[0] = j;
                    break;
                }
            }
            DB.pool.query('INSERT INTO public."ve"(id_dc,ma_ghe,dc_ngang,dc_doc,gia_tien) VALUES ($1, $2,$3,$4,$5)', [id, item, i[0], i[1], params.gia_tien], (err, res) => {
               
            })
        }
    })
    const getTicket = DB.getTicket(req.session.user.id, id);
    getTicket.then(function (data) {
        var Ticket = data.rows[0];
        console.log(Ticket);
        const output = `
        <h2>AVENGER CINEMAX </h2>
            <h3>Bạn đã đặt vé thành công!</h3>
            <h3>Thông tin vé:</h3>
            <ul>
                <li>Người dùng: ${req.session.user.name} </li>
                <li>Rạp: ${Ticket.rap} </li>
                <li>Loại rạp: ${Ticket.loai_rap} </li>
                <li>Phim: ${Ticket.phim}</li>
                <li>Thời gian: ${Ticket.tg_batdau}</li>
                <li>Giá vé:  ${Ticket.giave}</li>
                <li>Danh sách ghế đã đặt: ${params.ma_ghe} </li>
                <li>Tổng tiền: ${Ticket.tong_tien} </li>
                <li>Mã dặt chỗ: ${Ticket.id} </li>
            </ul>
            
            `;
        async function main() {
            let testAccount = await nodemailer.createTestAccount();
            let transporter = nodemailer.createTransport({
                host: "smtp.gmail.com",
                port: 587,
                secure: false, // true for 465, false for other ports
                auth: {
                    user: 'nodej2019s@gmail.com',
                    pass: 'Node@2019',
                }
            });

            // send mail with defined transport object
            let info = await transporter.sendMail({
                from: '"AVENGER  👻" <nodej2019s@gmail.com>', // sender address
                to: req.session.email,// list of receivers
                subject: "Hello ✔", // Subject line
                text: "Hello world?", // plain text body
                html: output // html body
            });

            console.log("Message sent: %s", info.messageId);
            console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        }
        main().catch(err => {
            console.error(err.message);
            process.exit(1);
        });
    });
      res.render('ok', { data: req.session.user, dataAdmin: req.session.userAdmin, error: "Bạn đã đặt vé thành công" })
});

module.exports = router;