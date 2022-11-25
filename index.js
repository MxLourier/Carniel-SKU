//i. Function definitions

// Resets field to only have one option - "--select--"
function clearOptions(field) {
  field.options.length = 1;
  clearOutput();
}

// find all children of "chosenParent" item and add them as options to childField
function addOptions(chosenParent, childField) {
  clearOptions(childField);
  const childOptions = contentTable.filter((item) => item.parent_code === chosenParent);
  for (const childOption of childOptions) {
    const newOption = new Option(childOption.category_name, childOption.category_code);
    childField.options.add(newOption);
  }
}

// Show a certain result in the ".output" area
function showOutput(instruction, example) {
  skuField.value = `${skuData.sku1}-${skuData.sku2}-XXXXXXXX-000`;
  instructionField.innerText = instruction ? instruction : '';
  exampleField.innerText = example ? example : '';
};

function clearOutput() {
  skuField.value = ``;
  instructionField.innerText = '';
  exampleField.innerText = '';
}

// Function triggered whenever one of the first two/three input fields changes
// 1. Clear all fields that are two levels lower
// e.g. whenever level 1 changes levels 3 and 4 are cleared
// 2. If "--select--" is chosen - clear child field as well and return
// 3. Populate child field according to the option selected in the parent field
function onChangeHandler(event) {
  if(this.getAttribute('id')!=='group'){
    hideCategoryField();
  }
  const dependentField = document.getElementById(this.getAttribute('data-dependent-id'));
  const chosenName = event.target.value;
  let fieldToClear = document.getElementById(dependentField.getAttribute('data-dependent-id'));
  while (fieldToClear) {
    clearOptions(fieldToClear);
    fieldToClear = document.getElementById(fieldToClear.getAttribute('data-dependent-id'));
  }
  if(chosenName==='--select--'){
    clearOptions(dependentField);
    return;
  }
  const chosenItem = contentTable.find(item => item.category_code===chosenName);
  addOptions(chosenItem.category_code, dependentField);

}

function showCategoryField() {
  document.getElementById('category').closest('div').style.display = '';
}

function hideCategoryField() {
  document.getElementById('category').closest('div').style.display = 'none';
}

// Change handler specific for 'group' fields
// If the chosen third level item has children => show fourth field
// If the chosen third level item has no children => go on to form output (not done yet)
function onChangeHandlerGroup(event) {
  hideCategoryField();
  const chosenItem = contentTable.find(item => item.category_code===event.target.value);
  const children = contentTable.find(item => item.parent_code===chosenItem.category_code);
  if(children) {
    showCategoryField();
    const bindedChangeHandler = onChangeHandler.bind(this);
    bindedChangeHandler(event);
    fourthElementExists = true;
  } else {
    fourthElementExists = false;
  }
}

// ii. function executions

// input fields
const mainFamilyField = document.getElementById('main-family');
const subFamilyField = document.getElementById('sub-family');
const groupField = document.getElementById('group');
const categoryField = document.getElementById('category');

// output fields
const skuField = document.getElementById('sku');
const instructionField = document.getElementById('instruction');
const exampleField = document.getElementById('example');

// Data pieces that will later form the "מק"ט" output field
// These are the sku values of the second level choice and forth level choice
// Empty initially
const skuData = {
  sku1: '',
  sku2: ''
}

// Variable that shows whether the current 3 level choice has children
// This will be used in the sku section
let fourthElementExists = true;



mainFamilyField.addEventListener('change', onChangeHandler);
subFamilyField.addEventListener('change', onChangeHandler);
groupField.addEventListener('change', onChangeHandlerGroup);

categoryField.addEventListener('change', event => {
  const chosenName = event.target.value;
  if (chosenName === '--select--') {
    clearOutput();
    return;
  }
  const chosenItem = contentTable.find(item => item.category_code === chosenName);
  skuData.sku2 = chosenItem.sku;
  showOutput(chosenItem.instruction, chosenItem.example);
});


// sku logic

// sku1: always determined by level 2 category
subFamilyField.addEventListener('change', event => {
  const chosenItem = contentTable.find(item => item.category_code===event.target.value);
  skuData.sku1 = chosenItem.sku;
});

// sku2: determined by level 3 category, overwridden by level 4 item if it exists
// Logic for level 4 sku is inside showCategoryField function
groupField.addEventListener('change', event => {
  const chosenItem = contentTable.find(item => item.category_code===event.target.value);
  skuData.sku2 = chosenItem.sku;
  if(!fourthElementExists){
    showOutput(chosenItem.instruction, chosenItem.example);
  }
});


// Fetch data table

const url = 'https://cpq.binet.co.il/api/cpq/sku/all';

class Item {
  constructor(parent_code, category_code, category_name, sku, instruction, example) {
    this.parent_code = parent_code;
    this.category_code = category_code;
    this.category_name = category_name;
    this.sku = sku;
    this.instruction = instruction;
    this.example = example;
  }
}

let contentTable = [];

function flattenArray(array) {
  for (let i = 0; i < array.length; i++) {
    contentTable.push(array[i]);
   if(array[i].children){
      flattenArray(array[i].children);
    }
  }
}

function convertArray(array) {
  const result = [];
  for(const element of array){
    const item = new Item(element.parent, element.id, element.label, element.sku, element.instruction, element.example);
    result.push(item);
  }
  return result;
}

const leftContainer = document.getElementById('left-container');

// This will create a (nested) unordered list to later be converted to a tree
function createHtmlTable(array, destination){
  const rootElement = document.createElement('ul');
  for(const item of array){
    const newNode = document.createElement('li');
    newNode.innerText = item.label;
    newNode.setAttribute('id', item.id);
    if(item.children){
      createHtmlTable(item.children, newNode);
    }
    rootElement.appendChild(newNode);
  }
  destination.appendChild(rootElement);
}

let promise = fetch(url);

promise.then(data => {
  return data.json();
}).then(table => {
  // Remove 'loading table' message from left container
  leftContainer.innerText = '';
  // Create html table from fetched data and append it to the left container div
  createHtmlTable(table, leftContainer);

  // Create flat contentTable and convert it to be an array of Item objects
  flattenArray(table);
  contentTable = convertArray(contentTable);
  // Start right container by showing all options in the "משפחה ראשית" field
  addOptions(0, document.getElementById('main-family'));

  // Create tree from the html table we created earlier
  $(function() {$('#left-container').jstree();});

  // Whenever we click on a tree node:
  // 1. If the node has children, do nothing.
  // 2. If the node has no children we form the output:
  // a) Second sku is the sku corresponding to the chosen node
  // b) First sku  - either the sku of the parent node or (if parent node has no sku) sku of the grandparent node
  // c) Derive the instruction and example values corresponding to chosen item and output the result
  $('#left-container').on('changed.jstree', function(e, data){
    if(!(data.node.children.length===0)){
      return;
    }
      const chosenItem = contentTable.find(item => {
        return item.category_code === data.node.id;
      });
      skuData.sku2 = chosenItem.sku;
      const parentNode = contentTable.find(item => {
        return item.category_code === chosenItem.parent_code;
      });
      if(parentNode.sku){
        skuData.sku1 = parentNode.sku;
      }else{
        const grandparentNode = contentTable.find(item => {
          return item.category_code === parentNode.parent_code;
        });
        skuData.sku1 = grandparentNode.sku;
      }
      showOutput(chosenItem.instruction, chosenItem.example);
  });
});






