var q = require("q"); // khai báo promise
const { Pool, Client } = require('pg')

// ============================== KẾT NỐI SQL
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'QuanLy',
    password: 'minh0love',
    port: 5432,
})


// Kiểm tra EMAIL
const getUserByEmail =  function (email){
  if(email){
      var defer = q.defer();

      pool.query('SELECT * FROM public."user" WHERE email = $1', [email], (err, dulieu) => {
          if(err){
              defer.reject(err);

          }else{

              defer.resolve(dulieu);
          }
      })
      return defer.promise;
  }
  return false;
}

const getTicket = function (id_user, id) {
    var defer = q.defer();
    pool.query('select dc.id, p.ten as phim, dc.tong_tien,sc.tg_batdau,sc.tg_ketthuc,sc.giave,r.ten as rap,r.loai_rap from phim p, datcho dc, suatchieu sc,rap r where p.id=sc.id_phim and dc.id_sc=sc.id_sc and r.id=sc.id_rap and dc.id_user=$1 and  dc.id=$2', [id_user, id], (err, as) => {
        if (err) {
            defer.reject(err);
        } else {
            defer.resolve(as);
        }
    })
    return defer.promise;
};

const getMovies = function () {
    var defer = q.defer();
    pool.query('select * from phim where ngay_cong_chieu < CURRENT_DATE  order by ngay_cong_chieu DESC limit 6', (err, as) => {
        if (err) {
            defer.reject(err);
        } else {
            defer.resolve(as);
        }
    })
    return defer.promise;
};
const getMoviesnear = function () {
    var defer = q.defer();
    pool.query('select * from phim where ngay_cong_chieu > CURRENT_DATE order by ngay_cong_chieu  LIMIT 6 ', (err, as) => {
        if (err) {
            defer.reject(err);
        } else {
            defer.resolve(as);
        }
    })
    return defer.promise;
};

module.exports.pool = pool;
module.exports.getUserByEmail = getUserByEmail;
module.exports.getTicket = getTicket;
module.exports.getMovies = getMovies;
module.exports.getMoviesnear = getMoviesnear;
