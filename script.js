// ─── State ───
let selectedGender = 0;

// ─── Navigation ───
function showCalculator(id) {
  // Hide all calculators
  document.querySelectorAll('.calculator').forEach(calc => {
    calc.style.display = 'none';
  });

  // Reset all nav buttons
  document.querySelectorAll('.menu button').forEach(btn => {
    btn.classList.remove('active');
  });

  // Show selected calculator with re-trigger animation
  const target = document.getElementById(id);
  target.style.display = 'flex';
  target.style.animation = 'none';
  target.offsetHeight; // force reflow
  target.style.animation = '';

  // Activate corresponding nav button
  if (id === 'alc-percent') {
    document.getElementById('btn-alc').classList.add('active');
  } else if (id === 'bac') {
    document.getElementById('btn-bac').classList.add('active');
  }
}

// ─── Add Drink Input Row ───
function addAlcoholInput(containerId) {
  const div = document.createElement('div');
  div.className = 'drink-row';
  div.innerHTML = `
    <input type="number" placeholder="용량 (ml)">
    <input type="number" placeholder="도수 (%)">
  `;
  document.getElementById(containerId).appendChild(div);
}

// ─── Gender Selector ───
function selectGender(gender) {
  selectedGender = gender;
  document.getElementById('sex').value = gender;

  const maleBtn = document.getElementById('gender-male');
  const femaleBtn = document.getElementById('gender-female');

  maleBtn.classList.toggle('selected', gender === 1);
  femaleBtn.classList.toggle('selected', gender === 2);
}

// ─── Result Display Helper ───
function showResult(elementId, icon, value, detail) {
  const el = document.getElementById(elementId);
  el.innerHTML = `
    <span class="result-icon">${icon}</span>
    <span class="result-value">${value}</span>
    ${detail ? `<span class="result-detail">${detail}</span>` : ''}
  `;
  el.classList.add('show');

  // Re-trigger animation
  el.style.animation = 'none';
  el.offsetHeight;
  el.style.animation = '';
}

function showError(elementId, message) {
  const el = document.getElementById(elementId);
  el.innerHTML = `<span class="result-icon">⚠️</span><span style="color:rgba(255,255,255,0.7);">${message}</span>`;
  el.classList.add('show');
  el.style.animation = 'none';
  el.offsetHeight;
  el.style.animation = '';
}

// ─── Cocktail ABV Calculator ───
function calcAlcoholPercent() {
  const inputs = document.querySelectorAll('#alc-list .drink-row');
  let totalML = 0;
  let totalAlcohol = 0;

  inputs.forEach(div => {
    const [ml, abv] = div.querySelectorAll('input');
    totalML += Number(ml.value);
    totalAlcohol += Number(ml.value) * (Number(abv.value) / 100);
  });

  if (totalML === 0) {
    showError('result1', '술을 추가하고 용량과 도수를 입력해주세요.');
    return;
  }

  const result = (totalAlcohol / totalML) * 100;
  const detail = `총 ${totalML}ml 중 순수 알코올 ${totalAlcohol.toFixed(1)}ml`;
  showResult('result1', '🍹', `${result.toFixed(1)}%`, detail);
}

// ─── BAC Calculator ───
function calcBAC() {
  const weight = Number(document.getElementById('weight').value);
  const sex = selectedGender;
  const hour = Number(document.getElementById('hour').value);
  const r = sex === 1 ? 0.86 : 0.64;
  const ALCOHOL_DENSITY = 0.789;

  if (sex === 0) {
    showError('result2', '성별을 선택해주세요.');
    return;
  }

  let totalGrams = 0;
  const inputs = document.querySelectorAll('#bac-list .drink-row');
  inputs.forEach(div => {
    const [ml, abv] = div.querySelectorAll('input');
    const pureAlcoholML = Number(ml.value) * (Number(abv.value) / 100);
    totalGrams += pureAlcoholML * ALCOHOL_DENSITY;
  });

  if (weight === 0 || totalGrams === 0) {
    showError('result2', '몸무게와 음주량을 모두 입력해주세요.');
    return;
  }

  const bodyMassG = weight * 1000;
  let bac = (totalGrams / (bodyMassG * r)) * 100;
  bac -= 0.015 * hour;
  if (bac < 0) bac = 0;

  let status = '';
  if (bac === 0) {
    status = '✅ 정상 범위';
  } else if (bac < 0.03) {
    status = '⚠️ 음주 감지 (면허정지 미만)';
  } else if (bac < 0.08) {
    status = '🚨 면허정지 수준 (0.03% 이상)';
  } else {
    status = '🛑 면허취소 수준 (0.08% 이상)';
  }

  showResult('result2', '🩸', `BAC: ${bac.toFixed(4)}%`, status);
}
