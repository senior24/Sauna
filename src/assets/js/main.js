const func = new Promise(function(resolve, reject) {
   console.log('Окей всё');
   const number = 1;
   resolve(number);
}).then(function(number) {
   console.log('Второй шаг' + number);
   return 1;
}).then(function(data) {
   console.log(data);
})