const express = require ('express');
const app = express();
const port = 3000;

app.get('/', (req, res) =>{
    res.send('Halo! Express berhasil diinstall.');
});

app.listen(port, () =>{
    console.log(`Server berjalan di http://localhost:${port}`);
});