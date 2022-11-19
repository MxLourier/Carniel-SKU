class Item {
  constructor(parent_code, level, category_code, category_name, sku, instruction, example){
    this.parent_code = parent_code;
    this.level = level;
    this.category_code = category_code;
    this.category_name = category_name;
    this.sku = sku;
    this.instruction = instruction;
    this.example = example;
  }
}


// sample input
const contentTable = [
  //level 1
  new Item(0, 1, 11, 'live'),
  new Item(0, 1, 12, 'inanimate'),
  // level 2
  new Item(11, 2, 111, 'animals', 'ANML'),
  new Item(11, 2, 112, 'plants', 'PLTS'),
  new Item(12, 2, 121, 'solid', 'SLID'),
  new Item(12, 2, 122, 'liquid', 'LQID'),
  new Item(12, 2, 123, 'gas', 'GAS'),
  // level 3
  new Item(111, 3, 1111, 'carnivore'),
  new Item(111, 3, 1112, 'herbivore'),
  new Item(112, 3, 1121, 'trees'),
  new Item(112, 3, 1122, 'bushes'),
  new Item(121, 3, 1211, 'metals'),
  new Item(121, 3, 1212, 'non-metals'),
  new Item(122, 3, 1221, 'drinkable'),
  new Item(122, 3, 1222, 'toxic'),
  new Item(123, 3, 1231, 'air'),
  new Item(123, 3, 1232, 'fire'),
  // level 4
  //Animals
  new Item(1111, 4, 11111, 'cat', 'CAT', 'cat instruction', 'cat example'),
  new Item(1111, 4, 11112, 'dog', 'DOG'),
  new Item(1112, 4, 11121, 'alpaca', 'ALPC'),
  new Item(1112, 4, 11122, 'sheep', 'SHEP'),
  new Item(1112, 4, 11123, 'camel', 'CAML'),
  //plants
  new Item(1121, 4, 11211, 'pine', 'PINE'),
  new Item(1121, 4, 11212, 'apple', 'APPL'),
  new Item(1121, 4, 11213, 'peach', 'PECH'),
  new Item(1121, 4, 11214, 'orange', 'ORNG', 'orange instruction', 'orange example'),
  new Item (1122, 4, 11221, 'rosemary', 'RMRY'),
  new Item(1122, 4, 11222, 'thime', 'THME'),
  //Solids
  new Item(1211, 4, 12111, 'silver', 'SLVR'),
  new Item(1211, 4, 12112, 'gold', 'GOLD'),
  new Item(1212, 4, 12121, 'wood', 'WOOD'),
  new Item(1212, 4, 12122, 'rubber', 'RBBR'),
  new Item(1212, 4, 12123, 'wax', 'WAX'),
  // Liquids
  new Item(1221, 4, 12211, 'water', 'WATR'),
  new Item(1221, 4, 12212, 'alcohol', 'ALCO'),
  new Item(1221, 4, 12213, 'oil', 'OIL'),
  new Item(1222, 4, 12221, 'methanol', 'MTHL'),
  // Gases
  new Item(1231, 4, 12311, 'Oxygen', 'OXGN'),
  new Item(1231, 4, 12312, 'Nitrogen', 'NRGN'),
  new Item(1232, 4, 1232, 'fossil gas', 'FOSG'),
];




// input fields
const mainFamilyField = document.getElementById('main-family');
const subFamilyField = document.getElementById('sub-family');
const groupField = document.getElementById('group');
const categoryField = document.getElementById('category');

// output fields
const skuField = document.getElementById('sku');
const instructionField = document.getElementById('instruction');
const exampleField = document.getElementById('example');

const skuData = {
  sku2: '',
  sku4: ''
}

function clearOptions(field) {
  field.innerHTML = '<option>--select--</option>';
  showOutput('', '', '');
}

function addOptions(chosenParent, childField) {
    clearOptions(childField);
    const childOptions = contentTable.filter((item) => item.parent_code===chosenParent);
    for(const childOption of childOptions){
      const newOption = document.createElement('option');
      newOption.innerText = childOption.category_name;
      childField.appendChild(newOption);
    }
  }

  function showOutput(sku, instruction, example){
    skuField.value = sku;
    instructionField.innerText = instruction;
    exampleField.innerText = example;
  };

addOptions(0, mainFamilyField);
//showOutput('example sku', 'dummy instruction', 'example text');

mainFamilyField.addEventListener('change', (event) => {
  const chosenName = event.target.value;
  clearOptions(groupField);
  clearOptions(categoryField);
  if(chosenName==='--select--'){
    clearOptions(subFamilyField);
    return;
  }
  console.log(chosenName);
  const chosenItem = contentTable.find(item => item.category_name===chosenName);
  console.log(chosenItem.category_code);
  addOptions(chosenItem.category_code, subFamilyField);
});

subFamilyField.addEventListener('change', (event) => {
  const chosenName = event.target.value;
  clearOptions(categoryField);
  if(chosenName==='--select--'){
    clearOptions(groupField);
    return;
  }
  console.log(chosenName);
  const chosenItem = contentTable.find(item => item.category_name===chosenName);
  skuData.sku2 = chosenItem.sku;
  console.log('sku2 = '+ chosenItem.sku);
  console.log(chosenItem.category_code);
  addOptions(chosenItem.category_code, groupField);
});

groupField.addEventListener('change', (event) => {
  const chosenName = event.target.value;
  if(chosenName==='--select--'){
    clearOptions(categoryField);
    return;
  }
  console.log(chosenName);
  const chosenItem = contentTable.find(item => item.category_name===chosenName);
  console.log(chosenItem.category_code);
  addOptions(chosenItem.category_code, categoryField);
});

categoryField.addEventListener('change', event => {
  const chosenName = event.target.value;
  if(chosenName==='--select--'){
    showOutput('', '', '');
    return;
  }
  console.log(chosenName);
  const chosenItem = contentTable.find(item => item.category_name===chosenName);
  skuData.sku4 = chosenItem.sku;
  console.log('sku4 = ' + skuData.sku4);
  console.log(chosenItem.category_code);
  const skuOutput = `${skuData.sku2}-${skuData.sku4}-XXXXXXXX-000`;
  showOutput(skuOutput, chosenItem.instruction, chosenItem.example);
});
