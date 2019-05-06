var express = require('express');
var port = 3000;
var app = express();
var router = express.Router();
var bodyParser = require('body-parser');
var logger = require('morgan');
var cors = require('cors');
const sgMail = require('@sendgrid/mail');
var key = process.env.key = "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";
var fs = require('fs');

app.use(bodyParser.json({limit: '2mb', extended: true}), cors());


app.post('/api/sendmail', function auth(req, res) {
  const recivedNbr = {number: req.body[0].number};
  sgMail.setApiKey(key);
  const msg = {
    to: '',
    from: '',
    subject: 'Nowa prośba o kontakt',
    html: 'Zapytanie o produkt: <strong>' + req.body[0].product + '</strong><br>Numer telefonu: <strong>'+ recivedNbr.number + '</strong>'
  };
sgMail.send(msg);
  res.json('Your email has been send with recived phone number: ' + recivedNbr.number);
});

app.post('/api/sendcv', function auth(req, res) {
  let reqFile = req.body.cvFile.toString().substring(28);
  sgMail.setApiKey(key);
  var buf = new Buffer( reqFile, 'base64'); // decode
  fs.writeFile('/share/CACHEDEV1_DATA/backend/uploads/cv.pdf', buf, function(err) {
    if(err) {
      console.log("err", err);
    } else {
      sendMail();
    }
  });

  function sendMail() {
    console.log('blob: ' + reqFile);
    const recivedForm = {
      jobname: req.body.jobname,
      name: req.body.name,
      lastname: req.body.lastname,
      mail: req.body.mail,
      msg: req.body.msg,
      cv: req.body.cvFIle
    }
    const msg = {
      to: '',
      from: '',
      subject: 'Nowe zgłoszenie na ofertę pracy',
      html: '<strong>Dane zgłaszającego gotowość do pracy:</strong> <br><strong> Oferta:</strong> ' + recivedForm.jobname + '<br><strong> Imię:</strong> ' + recivedForm.name + '<br><strong> Nazwisko:</strong> ' + recivedForm.lastname + '<br><strong> Mail:</strong> ' + recivedForm.mail + '<br><strong> Wiadomość:</strong> <br>' + recivedForm.msg,
      attachments: [
        {
          content: reqFile,
          filename: recivedForm.name + '_' + recivedForm.lastname + '_' + '.pdf',
          type: 'plain/text',
          disposition: 'attachment',
          content_id: 'cv'
        },
      ],
    };
    sgMail.send(msg).then(()=>{
      res.json('Twoje CV zostało wysłane do pracodawcy.');
    }).catch((err)=>{
      res.json({err: err});
    });
  }
});

app.listen(port, function(){
  console.log('Node server is running at port: ' + port);
})