const schedule = require('node-schedule');
const axios = require('axios');

const courseMap = {
  1: [1,1,0,1],
  2: [0,1,0,1],
  3: [1,1,1,1],
  4: [1,1,1,1],
  5: [1,1,0,1],
  6: [0,0,0,0],
  7: [0,0,0,1],
}

const courseImg = 'http://ydlunacommon-cdn.nos-jd.163yun.com/6183d361ddd444cc9b7b51cac1960811.jpg';

const img2 = 'http://dingyue.ws.126.net/2022/1120/908b17a5g00rln9mx009qc000n000ixm.gif';

const timeMap = {
  0: '50 7',
  1: '50 9',
  2: '20 13',
  3: '10 15',
}

function jobs() {
  Object.keys(courseMap).forEach(wek => {
    courseMap[wek].forEach((it, i) => {
      if (it) {
        schedule.scheduleJob(`0 ${timeMap[i]} * * ${wek}`, function(){
          axios.post('http://www.pushplus.plus/send', {
            token: 'a547d1fa9fba409f8bc6cb1a3aa880cc',
            to: '3c5211360ba04d6e8bc5a3bc1232de84',
            title: '小^(*￣(oo)￣)^上课啦！！!',
            content: `<img src="${courseImg}" /><br/><img src="${img2}" />`,
            template: 'html',
          })
        });
      }
    })
  })
  // schedule.scheduleJob('3 * * * * *', function(){
  //   axios.post('http://www.pushplus.plus/send', {
  //     token: 'a547d1fa9fba409f8bc6cb1a3aa880cc',
  //     // to: '3c5211360ba04d6e8bc5a3bc1232de84',
  //     title: '小^(*￣(oo)￣)^上课啦！！!',
  //     content: `<img src="${courseImg}" /><br/><img src="${img2}" />`,
  //     template: 'html',
  //   }).then(res => {
  //     console.log(res)
  //   }).catch(e => {
  //     console.log(e);
  //   })
  // });

  // schedule.scheduleJob('*/5 * * * * *', function(){
  //   console.log('删除时间:', new Date().toLocaleString());
  // });
}

module.exports = jobs;