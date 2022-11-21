class Item {
  constructor(parent_code, level, category_code, category_name, sku, instruction, example) {
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
  new Item(1122, 4, 11221, 'rosemary', 'RMRY'),
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

// output fields
const skuField = document.getElementById('sku');
const instructionField = document.getElementById('instruction');
const exampleField = document.getElementById('example');

// Data pieces that will later form the "מק"ט" output field
// These are the sku values of the second level choice and forth level choice
// Empty initially
const skuData = {
  sku2: '',
  sku4: ''
}


// Resets field to only have one option - "--select--"
function clearOptions(field) {
  field.options.length = 1;
  showOutput('', '', '');
}

// find all children of "chosenParent" item and add them as options to childField
function addOptions(chosenParent, childField) {
  clearOptions(childField);
  const childOptions = contentTable.filter((item) => item.parent_code === chosenParent);
  for (const childOption of childOptions) {
    const newOption = document.createElement('option');
    newOption.innerText = childOption.category_name;
    childField.appendChild(newOption);
  }
}

// Show a certain result in the ".output" area
function showOutput(sku, instruction, example) {
  skuField.value = sku;
  instructionField.innerText = instruction;
  exampleField.innerText = example;
};

// Start by showing all options in the "משפחה ראשית" field
addOptions(0, document.getElementById('main-family'));

// Function triggered whenever one of the input fields changes
// 1. Clear all fields that are two levels lower
// e.g. whenever level 1 changes levels 3 and 4 are cleared
// 2. If "--select--" is chosen - clear child field as well and return
// 3. Populate child field according to the option selected in the parent fields
// 4. For level 2 only: save the sku value of the chosen option
function onChangeHandler(event) {
  const dependentField = document.getElementById(this.getAttribute('data-dependent-id'));
  const chosenName = event.target.value;
  let fieldToClear = document.getElementById(dependentField.getAttribute('data-dependent-id'));
  while (fieldToClear) {
    console.log('run clear!');
    clearOptions(fieldToClear);
    fieldToClear = document.getElementById(fieldToClear.getAttribute('data-dependent-id'));
  }
  if(chosenName==='--select--'){
    clearOptions(dependentField);
    return;
  }
  console.log(chosenName);
  const chosenItem = contentTable.find(item => item.category_name===chosenName);
  console.log(chosenItem.category_code);
  addOptions(chosenItem.category_code, dependentField);
  if(this.getAttribute('data-dependent-id')==='group'){
    console.log('setting sku2!');
    skuData.sku2 = chosenItem.sku;
  }
}

// Add onChangeHandler function ONLY for the first three input fields
document.querySelectorAll('select.firstThree').forEach((field) => {
  field.addEventListener('change', onChangeHandler);
});

// Last input field needs a different onChange handler
document.getElementById('category').addEventListener('change', event => {
  const chosenName = event.target.value;
  if (chosenName === '--select--') {
    showOutput('', '', '');
    return;
  }
  console.log(chosenName);
  const chosenItem = contentTable.find(item => item.category_name === chosenName);
  skuData.sku4 = chosenItem.sku;
  console.log('sku4 = ' + skuData.sku4);
  console.log(chosenItem.category_code);
  const skuOutput = `${skuData.sku2}-${skuData.sku4}-XXXXXXXX-000`;
  showOutput(skuOutput, chosenItem.instruction, chosenItem.example);
});
