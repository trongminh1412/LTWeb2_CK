const express = require('express');
const session = require('express-session');
const router = express.Router();
const helper = require('../helpers/helper');
const ejsLint = require('ejs-lint');
var dateFormat = require('dateformat');

// require DATABASE
const DB = require('../models/db');


// require USER and ADMIN
router.use("/admin", require(__dirname + "/admin"));
router.use("/user", require(__dirname + "/user"));
router.use("/cinox", require(__dirname + "/cinox"));
router.use("/book", require(__dirname + "/book"));
/* GET home page. */
router.get('/', function (req, res, next) {
    DB.pool.query('SELECT * FROM public."user"', (err, res) => {
        //console.log(res.rows);

    })
    const getMovies = DB.getMovies();

    getMovies.then(function (movie) {
        const getMoviesnear = DB.getMoviesnear();
        getMoviesnear.then(function (movienear) {
            req.session.movie=movie;
            req.session.movien=movienear;
            res.render('index', { title: 'Trang Chủ', data: req.session.user, dataAdmin: req.session.userAdmin, email: req.session.email,movie:req.session.movie,movien:req.session.movien});
        })
    })

});

// ============= đăng nhập
router.get("/login", function (req, res) {
    if (req.session.user) {
        return res.render('index', { title: 'Trang Chủ', data: req.session.user, dataAdmin: req.session.userAdmin,movie:req.session.movie,movien:req.session.movien });
    }
    res.render("login", { data: "", dataAdmin: "", error: "" });
})

// ============= post đăng nhập
router.post("/login", function (req, res) {

    var params = req.body;

    if (params.email.trim().length == 0) {

        res.render("login", { error: "Bạn chưa nhập email", data: "" });
    }
    else {

        const getEmail = DB.getUserByEmail(params.email);

        if (getEmail) {

            getEmail.then(function (data) {

                var user = data.rows[0];
                // console.log(data.rows[0]);

                // giải mã password
                var status = helper.compare_password(params.password, user.password);

                if (!status) {

                    res.render("login", { error: "Bạn nhập sai password", data: "" });

                } else {

                    // đẩy thông tin user vào trong session
                    req.session.user = user;
                    req.session.userAdmin = user.userAdmin;
                    req.session.email = user.email;
                    console.log(user);
                    console.log("Session " + req.session.user.name);
                    // đăng nhập thành công
                    return res.render("index", { title: 'Trang Chủ', data: req.session.user, dataAdmin: req.session.userAdmin, email: req.session.email,movie:req.session.movie,movien:req.session.movien });
                }
            }).catch(function (err) {

                res.render("login", { error: "Email của bạn sai!!", data: "" });

            })
        }

    }
})


router.get("/exit", function (req, res) {
    if (!req.session.user) {
        return res.render("index", { title: 'Trang Chủ', data: "" });
    }
    req.session.destroy((err) => {
        if (err) {
            return console.log(err);
        }
        res.redirect('/');
    });
})

// ============= EDIT USER
router.get("/edit", function (req, res) {
    if (!req.session.user) {
        return res.render('index', { title: 'Trang Chủ', data: "", movie: req.session.movie, movien: req.session.movien });
    } else {
        DB.pool.query('SELECT * FROM public."user" WHERE id = $1', [req.session.user.id], (err, dulieus) => {
            DB.pool.query('select v.*,p.ten as phim,sc.tg_batdau,tg_ketthuc,r.ten as rap,cr.ten as cumrap, dc.createAt from datcho dc, rap r, cumrap cr, ve v, suatchieu sc,phim p where dc.id_sc= sc.id_sc and sc.id_phim=p.id and v.id_dc=dc.id and sc.id_rap=r.id and r.id_cum_rap=cr.id and dc.id_user=$1', [req.session.user.id], (err, v) => {
                console.log(v.rows);
                res.render("edit", { data: req.session.user.name, dataAdmin: req.session.userAdmin, email: req.session.email, dulieu: dulieus.rows[0] ,ve:v})
            })
        })
    }
})

// ============= UPDATE Info USER
router.post("/edit", function (req, res) {
    if (!req.session.user) {
        return res.render('index', { title: 'Trang Chủ', data: "" ,movie:req.session.movie,movien:req.session.movien});
    } else {
        var name = req.body.name;
        var email = req.body.email;
        var sdt = req.body.sdt;
        var password = req.body.password;

        // mã hóa password
        const pass = helper.hash_password(password);

        if(password == ''){
            DB.pool.query('UPDATE public."user" SET name = $1, sdt = $2, email = $3 WHERE id = $4', [name, sdt, email, req.session.user.id], (err, res) => {
                
            });

            const getEmail = DB.getUserByEmail(email);

            if(getEmail){

                getEmail.then(function(data){

                    var user = data.rows[0];
                    req.session.user = user;

                    console.log(user);
                    console.log( "Session " + req.session.user.name);

                })
            }
            
        } else {

            DB.pool.query('UPDATE public."user" SET name = $1, sdt = $2, email = $3, password = $4 WHERE id = $5', [name, sdt, email, pass, req.session.user.id], (err, res) => {
            
            });

            const getEmail = DB.getUserByEmail(email);

            if(getEmail){

                getEmail.then(function(data){

                    var user = data.rows[0];
                    req.session.user = user;

                    console.log(user);
                    console.log( "Session " + req.session.user.name);

                })
            }
        }
        
        //req.session.user.name = res.rows[0].name;

        res.render('index', { title: 'Trang Chủ', data: req.session.user, dataAdmin: req.session.userAdmin, email: req.session.email ,movie:req.session.movie,movien:req.session.movien});
    }
})

router.post("/search-movies", function (req, res) {
    var params = req.body;
    DB.pool.query("select * from phim where ten ilike '%' || $1 || '%'", [params.search], (err, phim) => {
        console.log(phim.rows);
        res.render('search', { data: req.session.user, dataAdmin: req.session.userAdmin, p: phim });
    });
})
router.post("/movies", function (req, res) {
    var params = req.body;
    DB.pool.query("select * from phim where id=$1", [params.id], (err, p) => {
        // console.log(p.rows);
        var day = dateFormat(p.rows[0].ngay_cong_chieu, "dd-mm-yyyy");
        //  console.log(day);

        //  console.log(p.rows);
        DB.pool.query('SELECT * FROM public.cumrap', (err, result) => {
            res.render("movies", { data: req.session.user.name, dataAdmin: req.session.userAdmin, phim: p, d: day, item: result,rap:"" })
        })
    })
})

// //load film lên trang chủ

// const movies=await Movies.findAll({

//     //console.log(res.rows);

//     attributres: ['id','name','publish_date','poster_image', 'duration']
// })
// res.render('index',{movies:movies})




module.exports = router;
