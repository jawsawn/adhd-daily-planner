const planner = document.getElementById('planner');

for (let hour = 8; hour <= 18; hour++) {
    const hourStr = `${hour}:00`;
    const saved = localStorage.getItem(`planner-${hour}`) || '';

    const block = document.createElement('div');
    block.className = 'hour-block';

    const label = document.createElement('div');
    label.className = 'hour-label';
    label.textContent = hourStr;

    const input = document.createElement('input');
    input.className = 'hour-input';
    input.type = 'text';
    input.value = saved;
    input.id = `input-${hour}`;

    const saveBtn = document.createElement('button');
    saveBtn.className = 'save-btn';
    saveBtn.textContent = 'Save';
    saveBtn.onclick = () => {
        localStorage.setItem(`planner-${hour}`, input.value);
        alert('Saved!');
    };

    block.appendChild(label);
    block.appendChild(input);
    block.appendChild(saveBtn);

    planner.appendChild(block);
}
