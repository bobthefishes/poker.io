const table = document.querySelector('.main_table');

async function getData() {
  try {
    const response = await fetch('../../accouns.json');

    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }

    const accounts = await response.json();

    console.log(accounts);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

getData();
