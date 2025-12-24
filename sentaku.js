const kisolb = document.getElementsByClassName('kisolb');
const henjolb = document.getElementsByClassName('henjolb');
const zentai = document.getElementsByClassName('zentai');
const kiso = document.querySelector('.kiso');
const henjo = document.querySelector('.henjo');
const tugi = document.querySelectorAll('.tugi');
const imaqu = document.querySelector('.ima');
const shitumon = document.querySelectorAll('.shitumon');
const kisoshitu = document.querySelectorAll('.shitumon.kiso');
const tugihe = document.querySelector('.tugihe');
const kisogou = document.getElementById('kisogou');


let totaltotal = 0;

if(imaqu.classList.contains('kiso')){
    henjo.classList.add('kesu');
    tugihe.classList.add('kesu'); 
}
let index = 0;

tugi.forEach(tugi => {
    tugi.addEventListener('click',()=>{
        if(index < kisoshitu.length){
            shitumon[index].classList.remove('ima');
            shitumon[index+1].classList.add('ima');
            index++;
            const checkkiso = document.querySelector('.jiban')
            let totalkiso = 0;
            checkkiso.forEach(checkkiso => {
                if(checkkiso.checked){
                    const imaten = Number(checkkiso.dataset.score);
                    totalkiso += imaten;
                }
            });
            kisogou.textContent = '基礎項目合計:' + totalkiso;
        }else if(index < shitumon.length-1){
            kiso.classList.add('kesu');
            henjo.classList.remove('kesu')
            shitumon[index].classList.remove('ima');
            shitumon[index+1].classList.add('ima');
            index++;
            const checkhenjo = document.querySelectorAll('.henjoqu')
            let totalhenjo = 0;
            checkhenjo.forEach(checkhenjo => {
                if(checkhenjo.checked){
                    totalhenjo = Number(checkhenjo.dataset.score);

                }
            });
            henjogou.textContent = '変状項目合計:' + totalhenjo;
        }
            else{
            kiso.classList.add('kesu');
            tugihe.classList.add('kesu');
            henjo.classList.add('kesu')

            }
})
})


