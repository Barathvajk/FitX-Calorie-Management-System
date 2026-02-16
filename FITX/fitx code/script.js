function addEntry() {
  const foodInput = document.getElementById('food');
  const caloriesInput = document.getElementById('calories');
  const entriesList = document.getElementById('entries');

  const food = foodInput.value;
  const calories = caloriesInput.value;

  if (food && calories) {
    const entry = document.createElement('li');
    entry.textContent = `${food}: ${calories} calories`;
    entriesList.appendChild(entry);

    // Clear input fields
    foodInput.value = '';
    caloriesInput.value = '';
  }
}
