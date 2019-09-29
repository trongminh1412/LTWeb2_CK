const express = require('express');
const router = express.Router();
const helper = require('../helpers/helper');
var dateFormat = require('dateformat');
// require DATABASE
const DB = require('../models/db');

router.get("/cinox", function (req, res, next) {
    DB.pool.query('SELECT * FROM public.cumrap', (err, result) => {
        DB.pool.query('SELECT * FROM public.rap', (err, abc) => {
            res.render('cinox', { title: 'Cụm Rạp', data: req.session.user, dataAdmin: req.session.userAdmin, item: result, rap: abc, phim: "" });
        })
    })

});
router.post("/cinox", function (req, res) {
    DB.pool.query('SELECT * FROM public.cumrap', (err, result) => {
        DB.pool.query('SELECT * FROM public.rap', (err, abc) => {
            var params = req.body;
            DB.pool.query('SELECT p.* FROM public.phim p left join public.suatchieu sc on p.id=sc.id_phim where sc.id_rap=$1 group by id', [params.id_rap], (err, asd) => {
                var params = req.body;
                DB.pool.query('SELECT p.*,sc.id_rap,r.ten as ten_rap,r.loai_rap,r.kt_ngang,r.kt_doc,sc.id_sc,sc.tg_batdau,sc.tg_ketthuc, sc.giave  FROM public.phim p,public.suatchieu sc,public.rap r where p.id=sc.id_phim and r.id=sc.id_rap and id_rap=$1', [params.id_rap], (err, asc) => {
                    res.render('cinox', { title: 'Cụm Rạp', data: req.session.user, dataAdmin: req.session.userAdmin, item: result, rap: abc, phim: asd, sc: asc });
                })
            })
        })
    })
});
router.post("/book", function (req, res) {

    if (!req.session.user) {
        return res.render("login", { error: "Bạn chưa đăng nhập để đặt vé", data: "", movie: req.session.movie, movien: req.session.movien });
    }
    else {
        var params = req.body;
        DB.pool.query('select * from public.datcho dc, public.ve v where dc.id=v.id_dc  and id_sc=$1', [params.id_sc], (err, maghe) => {
            DB.pool.query('SELECT p.*,sc.id_rap,r.ten as ten_rap,r.loai_rap,r.kt_ngang,r.kt_doc,sc.id_sc,sc.tg_batdau,sc.tg_ketthuc, sc.giave FROM public.phim p,public.suatchieu sc,public.rap r where p.id=sc.id_phim and r.id=sc.id_rap and id_rap=$1 and id_sc=$2', [params.id_rap, params.id_sc], (err, asc) => {
                res.render('book', { data: req.session.user, dataAdmin: req.session.userAdmin, book: asc, ghe: maghe });
            });
        });
    }
});
router.post("/cine", function (req, res) {
    var params = req.body;
    DB.pool.query('select * from public."phim" where id=$1', [params.id_phim], (err, p) => {
        var day = dateFormat(p.rows[0].ngay_cong_chieu, "dd-mm-yyyy");
        console.log(p.rows);
        DB.pool.query('SELECT * FROM cumrap', (err,cr) => {
            console.log(cr.rows);
            DB.pool.query('SELECT * FROM rap where id_cum_rap=$1', [params.id_cum_rap],(err, result) => {
                console.log(result.rows);
                DB.pool.query('select sc.id_rap,r.ten as ten_rap,r.id_cum_rap,r.loai_rap,r.kt_ngang,r.kt_doc,sc.id_sc,sc.tg_batdau,sc.tg_ketthuc from phim p,rap r, suatchieu sc where r.id=sc.id_rap and p.id=sc.id_phim and p.id=$1 and r.id_cum_rap=$2', [params.id_phim,params.id_cum_rap], (err, asc) => {
                    console.log(asc.rows);
                    res.render("movies", { data: req.session.user, dataAdmin: req.session.userAdmin, phim: p, d: day, item: cr, rap:result, suatchieu:asc})
                })
            })
        })
    })
})
module.exports = router;

