class App {

  constructor() {
    this.list = document.querySelector('.list-group');
    this.select = document.querySelector('#type');
    this.items = [];
    this.types = [];
    this.sorted = false;
    this.getData();
  }
  
  async getData() {
    try {
      let items = fetch('http://rygorh.dev.monterosa.co.uk/todo/items.php');
      let types = fetch('http://rygorh.dev.monterosa.co.uk/todo/types.php');
      
      items = await items;
      types = await types;
      
      this.items = await items.json();
      this.types = await types.json();
      
      console.log(this.items);
      console.log(this.types);
      
      this.printData();
      this.printTypes();
    }
    catch (error) {
      throw new Error(error);
    }
  }
  
  printData(data = this.items) {
    const items = data
      .reduce((items, item) => {
        const date = new Date(item.expires_at);
        
        const formatDate = `${ date.getHours() }:${ date.getMinutes() }:${ date.getSeconds() } ${ date.getMonth() + 1 }/${ date.getDay() + 1 }/${ date.getFullYear() }`;
      
        return items += `
          <li class="list-group-item list-group-item-action">
            <div class="d-flex w-100 justify-content-between">
              <span class="mr-5">${item.task}</span>
              <small>${formatDate}</small> 
            </div>
          </li>
        `
      }, '');
    
    // console.log(items);
    
    this.list
      .innerHTML = items;
  }
  
  printTypes() {
    const types = this.types
      .slice()
      .sort((a, b) => a.id - b.id)
      .reduce((types, type) => types += `<option value="${type.id}">${type.name}</option>`, '<option selected>Type…</option>');
    
    this.select
      .innerHTML = types;
  }

  addItem(event) {
    event.preventDefault();

    const form = new FormData(addItem);

    const task = form.get('task'),
          type = form.get('type');
    
    let expiry = form.get('expiry');

    expiry = new Date(expiry).getTime();

    const item = {
      task: task,
      expires_at: expiry,
      created_at: Date.now(),
      done: false,
      type: type
    };

    console.log(item);
  }

  toggleExpiry() {
    if (this.sorted) {
      this.printData();
    } else {
      const items = this.items
        .slice()
        .sort((a, b) => a.expires_at - b.expires_at);
      this.printData(items);
    }

    this.sorted = !this.sorted;
  }

}

const addItem = document.querySelector('.add-item');
const toggleExpiry = document.querySelector('.toggle-expiry');

const app = new App();

addItem.addEventListener('submit', () => app.addItem(event));
toggleExpiry.addEventListener('click', () => app.toggleExpiry());