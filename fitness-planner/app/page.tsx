"use client"

import { useEffect } from "react"
import Script from "next/script"
import "./planner.css"

const plannerLogic = `
  const PLANNED_WEEKS = 12;
  let currentPageNum = 1;

  function saveProgress() {
    const data = {};
    data.theme = document.body.getAttribute('data-theme');
    document.querySelectorAll('#planner-content [data-type="input"]').forEach(input => {
      data[input.dataset.id] = input.value;
    });
    document.querySelectorAll('#planner-content [data-type="checkbox"]').forEach(checkbox => {
      data[checkbox.dataset.id] = checkbox.classList.contains('checked');
    });
    localStorage.setItem('returnToFormPlannerData', JSON.stringify(data));
    console.log('✅ Progress Saved at:', new Date().toLocaleTimeString());
    const saveBtn = document.querySelector('[data-save-btn="true"]');
    if (saveBtn) {
      const originalText = saveBtn.textContent;
      saveBtn.textContent = '💾 SAVED!';
      setTimeout(() => {
        saveBtn.textContent = originalText;
      }, 1000);
    }
  }
  window.saveProgress = saveProgress;

  function loadProgress() {
    const dataString = localStorage.getItem('returnToFormPlannerData');
    if (!dataString) {
      console.log('No saved data found. Starting fresh.');
      return;
    }
    try {
      const data = JSON.parse(dataString);
      if (data.theme) {
        setTheme(data.theme);
      }
      document.querySelectorAll('#planner-content [data-type="input"]').forEach(input => {
        const value = data[input.dataset.id];
        if (value !== undefined) {
          input.value = value;
        }
      });
      document.querySelectorAll('#planner-content [data-type="checkbox"]').forEach(checkbox => {
        const isChecked = data[checkbox.dataset.id];
        if (isChecked === true) {
          checkbox.classList.add('checked');
        } else if (isChecked === false) {
          checkbox.classList.remove('checked');
        }
      });
      calculateDailyRPE();
      console.log('✅ Progress Loaded.');
    } catch (e) {
      console.error('Error loading data:', e);
    }
  }

  function toggleCheckbox(element) {
    element.classList.toggle('checked');
    saveProgress();
  }
  window.toggleCheckbox = toggleCheckbox;

  function generatePageNumber() {
    const pageNumElement = document.createElement('div');
    pageNumElement.classList.add('page-number');
    pageNumElement.textContent = \`PAGE \${currentPageNum++} / \${PLANNED_WEEKS * 12 + 3}\`;
    return pageNumElement;
  }

  function generateWeeklyLogs() {
    const plannerContainer = document.getElementById('planner-content');
    
    for (let week = 1; week <= PLANNED_WEEKS; week++) {
      const weeklyPage = document.createElement('div');
      weeklyPage.classList.add('page');
      weeklyPage.id = \`week-log-\${week}\`;
      
      weeklyPage.innerHTML = \`
        <div class="week-label">WEEK \${week} LOG - THE CORE</div>
        <h1>🎯 WEEKLY OBJECTIVES</h1>
        <div class="goal-section" style="border-left-color: var(--accent-secondary);">
          <h3>Primary Focus</h3>
          <textarea class="input-field" data-type="input" data-id="w\${week}-focus" placeholder="The single most important outcome for this week..."></textarea>
          <h3>Daily Habits/Non-negotiables (Check when completed)</h3>
          <div style="display: flex; gap: 20px; flex-wrap: wrap;">
            <label style="display: flex; align-items: center; gap: 8px;"><div class="checkbox" data-type="checkbox" data-id="w\${week}-n1" onclick="toggleCheckbox(this)"></div> Habit 1</label>
            <label style="display: flex; align-items: center; gap: 8px;"><div class="checkbox" data-type="checkbox" data-id="w\${week}-n2" onclick="toggleCheckbox(this)"></div> Habit 2</label>
            <label style="display: flex; align-items: center; gap: 8px;"><div class="checkbox" data-type="checkbox" data-id="w\${week}-n3" onclick="toggleCheckbox(this)"></div> Habit 3</label>
            <label style="display: flex; align-items: center; gap: 8px;"><div class="checkbox" data-type="checkbox" data-id="w\${week}-n4" onclick="toggleCheckbox(this)"></div> Habit 4</label>
          </div>
        </div>
        <h2>Habit & Recovery Tracker (1=Yes, 0=No)</h2>
        <div class="habit-tracker">
          <div class="habit-header">HABIT / FOCUS</div>
          <div class="habit-header">M</div>
          <div class="habit-header">T</div>
          <div class="habit-header">W</div>
          <div class="habit-header">T</div>
          <div class="habit-header">F</div>
          <div class="habit-header">S</div>
          <div class="habit-header">S</div>
          
          <div class="grid-cell" style="font-weight: 600;">Sleep Goal Reached (e.g., 7.5 hrs)</div>
          \${['m','t','w','th','f','sa','su'].map(d => \`<div class="habit-cell"><div class="checkbox" data-type="checkbox" data-id="w\${week}-h1-\${d}" onclick="toggleCheckbox(this)"></div></div>\`).join('')}
          
          <div class="grid-cell" style="font-weight: 600;">Nutrition Compliant (Macros/Calories)</div>
          \${['m','t','w','th','f','sa','su'].map(d => \`<div class="habit-cell"><div class="checkbox" data-type="checkbox" data-id="w\${week}-h2-\${d}" onclick="toggleCheckbox(this)"></div></div>\`).join('')}
          
          <div class="grid-cell" style="font-weight: 600;">Hydration Target Met</div>
          \${['m','t','w','th','f','sa','su'].map(d => \`<div class="habit-cell"><div class="checkbox" data-type="checkbox" data-id="w\${week}-h3-\${d}" onclick="toggleCheckbox(this)"></div></div>\`).join('')}
          
          <div class="grid-cell" style="font-weight: 600;">Mindset/Meditation/Reading</div>
          \${['m','t','w','th','f','sa','su'].map(d => \`<div class="habit-cell"><div class="checkbox" data-type="checkbox" data-id="w\${week}-h4-\${d}" onclick="toggleCheckbox(this)"></div></div>\`).join('')}
          
          <div class="grid-cell" style="font-weight: 600; color: var(--accent-primary);">TOTAL WORKOUTS COMPLETED</div>
          <div class="habit-cell" style="grid-column: span 7; padding: 0.5rem;">
            <input type="text" class="input-field" data-type="input" data-id="w\${week}-total-workouts" placeholder="e.g., 5/7" style="border: none; text-align: center; font-weight: 700;">
          </div>
        </div>
        <h2>Weekly Review & Strategy</h2>
        <textarea class="input-field" data-type="input" data-id="w\${week}-review" rows="4" placeholder="What went right? What went wrong? What is the 1 adjustment you will make for next week?"></textarea>
      \`;
      
      weeklyPage.appendChild(generatePageNumber());
      plannerContainer.appendChild(weeklyPage);

      const days = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
      days.forEach((day, index) => {
        const dailyPage = document.createElement('div');
        dailyPage.classList.add('page');
        dailyPage.id = \`w\${week}d\${index+1}-log\`;
        
        dailyPage.innerHTML = \`
          <div class="date-header">\${day}, WEEK \${week}</div>
          <h1>🏋️ WORKOUT LOG</h1>
          <h3 style="margin-top: -0.5rem;">Planned Training: <input type="text" class="input-field" data-type="input" data-id="w\${week}d\${index+1}-planned" placeholder="e.g., Chest & Triceps / LISS Cardio" style="width: 50%; display: inline; border-bottom: 1px dashed var(--accent-secondary); margin: 0;"></h3>
          <div class="workout-grid">
            <div class="grid-header">EXERCISE</div>
            <div class="grid-header">SET 1</div>
            <div class="grid-header">SET 2</div>
            <div class="grid-header">SET 3</div>
            <div class="grid-header">SET 4</div>
            <div class="grid-header">RPE / NOTES</div>
            \${[...Array(6).keys()].map(i => \`
              <div class="grid-cell"><input type="text" class="input-field" data-type="input" data-id="w\${week}d\${index+1}e\${i+1}-name" placeholder="e.g., Barbell Bench Press" style="margin: 0; padding: 0; border: none;"></div>
              <div class="grid-cell"><input type="text" class="input-field" data-type="input" data-id="w\${week}d\${index+1}e\${i+1}-s1" placeholder="e.g., 10x135" style="margin: 0; padding: 0; border: none; text-align: center;"></div>
              <div class="grid-cell"><input type="text" class="input-field" data-type="input" data-id="w\${week}d\${index+1}e\${i+1}-s2" placeholder="e.g., 8x155" style="margin: 0; padding: 0; border: none; text-align: center;"></div>
              <div class="grid-cell"><input type="text" class="input-field" data-type="input" data-id="w\${week}d\${index+1}e\${i+1}-s3" placeholder="e.g., 6x175" style="margin: 0; padding: 0; border: none; text-align: center;"></div>
              <div class="grid-cell"><input type="text" class="input-field" data-type="input" data-id="w\${week}d\${index+1}e\${i+1}-s4" placeholder="e.g., 5x185" style="margin: 0; padding: 0; border: none; text-align: center;"></div>
              <div class="grid-cell"><input type="text" class="input-field" data-type="input" data-id="w\${week}d\${index+1}e\${i+1}-rpe" placeholder="e.g., RPE 8.5" style="margin: 0; padding: 0; border: none;"></div>
            \`).join('')}
          </div>
          <h1>⭐ DAILY RPE & NOTES</h1>
          <div class="goal-section" data-rpe-section>
            <h3 style="margin-top: 0; color: var(--accent-secondary);">Daily Performance Score (1-10)</h3>
            <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 1rem;">
              <div style="grid-column: span 1;">Workout Intensity:</div>
              <div style="grid-column: span 1;"><input type="number" min="1" max="10" class="input-field daily-rpe-input" placeholder="/10" data-type="input" data-id="w\${week}d\${index+1}rpe-workout"></div>
              <div style="grid-column: span 4; color: var(--text-secondary); font-size: 0.9rem;">(How hard was your main session?)</div>
              <div style="grid-column: span 1;">Nutrition Adherence:</div>
              <div style="grid-column: span 1;"><input type="number" min="1" max="10" class="input-field daily-rpe-input" placeholder="/10" data-type="input" data-id="w\${week}d\${index+1}rpe-nutrition"></div>
              <div style="grid-column: span 4; color: var(--text-secondary); font-size: 0.9rem;">(How closely did you stick to your diet?)</div>
              <div style="grid-column: span 1;">Sleep Quality:</div>
              <div style="grid-column: span 1;"><input type="number" min="1" max="10" class="input-field daily-rpe-input" placeholder="/10" data-type="input" data-id="w\${week}d\${index+1}rpe-sleep"></div>
              <div style="grid-column: span 4; color: var(--text-secondary); font-size: 0.9rem;">(Did you hit your sleep target?)</div>
              <div style="grid-column: span 1;">Hydration/Supplements:</div>
              <div style={{ gridColumn: "span 1" }}><input type="number" min="1" max="10" class="input-field daily-rpe-input" placeholder="/10" data-type="input" data-id="w\${week}d\${index+1}rpe-hydration"></div>
              <div style="grid-column: span 4; color: var(--text-secondary); font-size: 0.9rem;">(Water intake, vitamin/supplement consistency)</div>
              <div style="grid-column: span 1;">Mindset/Focus:</div>
              <div style={{ gridColumn: "span 1" }}><input type="number" min="1" max="10" class="input-field daily-rpe-input" placeholder="/10" data-type="input" data-id="w\${week}d\${index+1}rpe-mindset"></div>
              <div style="grid-column: span 4; color: var(--text-secondary); font-size: 0.9rem;">(Mental clarity, stress management)</div>
            </div>
            <div style="margin-top: 1.5rem; border-top: 2px solid var(--accent-primary); padding-top: 1rem; display: grid; grid-template-columns: repeat(6, 1fr); gap: 1rem;">
              <div style="grid-column: span 1; font-weight: 700; color: var(--accent-secondary);">TOTAL DAILY RPE (Max 50)</div>
              <div style="grid-column: span 1;">
                <input type="text" class="input-field" placeholder="/50" readonly data-type="input" data-id="w\${week}d\${index+1}rpe-total" style="color: var(--accent-primary); font-weight: 700; background: var(--primary-bg); text-align: center;">
              </div>
            </div>
          </div>
          <h2>Daily Notes & Lessons Learned</h2>
          <textarea class="input-field" data-type="input" data-id="w\${week}d\${index+1}-notes" rows="4" placeholder="Any crucial notes, how you felt, injuries, or key wins today..."></textarea>
        \`;
        
        dailyPage.appendChild(generatePageNumber());
        plannerContainer.appendChild(dailyPage);
      });
      
      const reviewPage = document.createElement('div');
      reviewPage.classList.add('page');
      reviewPage.id = \`week-review-\${week}\`;
      
      reviewPage.innerHTML = \`
        <div class="week-label">WEEK \${week} REVIEW & FORECAST</div>
        <h1>📝 REVIEW</h1>
        <h2>Weekly Summary & High-Level Metrics</h2>
        <textarea class="input-field" data-type="input" data-id="w\${week}-summary" rows="3" placeholder="Summarize the week: key wins, total workouts, adherence score, how you feel..."></textarea>
        <h2>Challenges & Lessons Learned</h2>
        <textarea class="input-field" data-type="input" data-id="w\${week}-lessons" rows="4" placeholder="What were the biggest obstacles? What is the core lesson you will carry forward?"></textarea>
        <h2>Weekly Photo Check (Optional)</h2>
        <div class="photo-box" style="height: 300px;">WEEK \${week} PROGRESS PHOTO (Upload or Sketch)</div>
        <h1>🔮 FORECAST (NEXT WEEK)</h1>
        <h2>The One Thing (Most Important Task)</h2>
        <textarea class="input-field" data-type="input" data-id="w\${week}-next-focus" rows="2" placeholder="Based on the review, what is the SINGLE, most important task for Week \${week + 1}?"></textarea>
        <h2>Key Adjustments & Strategy</h2>
        <textarea class="input-field" data-type="input" data-id="w\${week}-adjustments" rows="4" placeholder="Specify workout, nutrition, or recovery changes for Week \${week + 1}."></textarea>
      \`;
      reviewPage.appendChild(generatePageNumber());
      plannerContainer.appendChild(reviewPage);

      for (let i = 1; i <= 3; i++) {
        const checkpointPage = document.createElement('div');
        checkpointPage.classList.add('page');
        checkpointPage.id = \`w\${week}cp\${i}-notes\`;
        
        checkpointPage.innerHTML = \`
          <div class="week-label">WEEK \${week} CHECKPOINT \${i} - FREE FORM</div>
          <h1>🧱 \${['MINDSET', 'NUTRITION', 'RECOVERY'][i-1]} FOCUS</h1>
          <h2>\${['Mental Fortitude & Stress Management', 'Fuel Strategy & Adherence', 'Sleep, Mobility & Injury Prevention'][i-1]}</h2>
          <textarea class="input-field" data-type="input" data-id="w\${week}cp\${i}-notes" rows="15" placeholder="Use this space for notes, calculations, meal planning, mobility routines, or mental checklists."></textarea>
          <div class="quote-box" style="margin-top: 3rem;">"Discipline is the bridge between goals and accomplishment."</div>
        \`;
        checkpointPage.appendChild(generatePageNumber());
        plannerContainer.appendChild(checkpointPage);
      }
    }
  }

  function generateEndPages() {
    const plannerContainer = document.getElementById('planner-content');
    const summaryPage = document.createElement('div');
    summaryPage.classList.add('page');
    summaryPage.id = 'final-summary';
    
    summaryPage.innerHTML = \`
      <div class="week-label" style="background: var(--accent-secondary); color: var(--primary-bg);">MISSION COMPLETE</div>
      <h1>🏆 12-WEEK SUMMARY</h1>
      <h2>Final Reflection & Key Takeaways</h2>
      <textarea class="input-field" data-type="input" data-id="final-reflection" rows="8" placeholder="Summarize your 12 weeks: What was your single greatest win? What was the hardest lesson? Are you satisfied with your Return to Form?"></textarea>
      <h2>Quantifiable Results</h2>
      <div class="measurement-grid">
        <div class="measure-header">Metric</div>
        <div class="measure-header">Start</div>
        <div class="measure-header">End</div>
        <div class="measure-cell">Weight</div>
        <div class="measure-cell"><input type="text" class="input-field" data-type="input" data-id="m-weight-start-final" placeholder="" style="border: none; text-align: center;"></div>
        <div class="measure-cell"><input type="text" class="input-field" data-type="input" data-id="m-weight-end-final" placeholder="" style="border: none; text-align: center;"></div>
        <div class="measure-cell">Key Lift PR (e.g., Bench)</div>
        <div class="measure-cell"><input type="text" class="input-field" data-type="input" data-id="m-lift-start" placeholder="" style="border: none; text-align: center;"></div>
        <div class="measure-cell"><input type="text" class="input-field" data-type="input" data-id="m-lift-end" placeholder="" style="border: none; text-align: center;"></div>
        <div class="measure-cell">Total Workouts Completed</div>
        <div class="measure-cell" colspan="2"><input type="text" class="input-field" data-type="input" data-id="m-total-workouts-final" placeholder="" style="border: none; text-align: center;"></div>
      </div>
      <h2>Next Mission / Future Goals</h2>
      <textarea class="input-field" data-type="input" data-id="next-mission" rows="4" placeholder="Where do you go from here? What is the next major challenge?"></textarea>
    \`;
    summaryPage.appendChild(generatePageNumber());
    plannerContainer.appendChild(summaryPage);

    const blankPage1 = document.createElement('div');
    blankPage1.classList.add('page');
    blankPage1.id = 'final-blank-1';
    blankPage1.innerHTML = \`
      <h1>FREE FORM NOTE PAGE 1</h1>
      <h2>Mind Maps, Calculations, or Custom Workouts</h2>
      <textarea class="input-field" data-type="input" data-id="final-notes-1" rows="28" placeholder=""></textarea>
    \`;
    blankPage1.appendChild(generatePageNumber());
    plannerContainer.appendChild(blankPage1);

    const blankPage2 = document.createElement('div');
    blankPage2.classList.add('page');
    blankPage2.id = 'final-blank-2';
    blankPage2.innerHTML = \`
      <h1>FREE FORM NOTE PAGE 2</h1>
      <h2>Mind Maps, Calculations, or Custom Workouts</h2>
      <textarea class="input-field" data-type="input" data-id="final-notes-2" rows="28" placeholder=""></textarea>
    \`;
    blankPage2.appendChild(generatePageNumber());
    plannerContainer.appendChild(blankPage2);
  }

  function generateTOC() {
    const navContainer = document.querySelector('#command-center .navigation');
    if (!navContainer) return;
    navContainer.innerHTML = '';
    const pages = document.querySelectorAll('.page');
    const tocEntries = [
      { selector: '#command-center', title: '1. COMMAND CENTER / OVERVIEW' },
      { selector: '#core-metrics', title: '2. CORE METRICS / VISION BOARD' },
      { selector: '#rpe-scale-reference', title: '3. RPE SCALE / DAILY AUTO-CALC' },
    ];
    for (let w = 1; w <= PLANNED_WEEKS; w++) {
      tocEntries.push({ selector: \`#week-log-\${w}\`, title: \`WEEK \${w} - Log, Goals & Strategy\` });
    }
    tocEntries.push({ selector: '#final-summary', title: '12-WEEK SUMMARY / FINAL METRICS' });
    tocEntries.forEach(entry => {
      const page = document.querySelector(entry.selector);
      if (page) {
        const pageNumElement = page.querySelector('.page-number');
        const pageNum = pageNumElement ? pageNumElement.textContent.replace('PAGE ', '').split(' / ')[0] : 'N/A';
        const navItem = document.createElement('a');
        navItem.href = \`#\${page.id || \`page-\${pageNum}\`}\`;
        navItem.classList.add('nav-item');
        navItem.innerHTML = \`<span class="nav-title">\${entry.title}</span><span class="nav-page">PAGE \${pageNum}</span>\`;
        navContainer.appendChild(navItem);
      }
    });
  }

  function setTheme(themeName) {
    document.body.setAttribute('data-theme', themeName);
    localStorage.setItem('selectedTheme', themeName);
    document.querySelectorAll('.theme-option').forEach(option => {
      if (option.dataset.theme === themeName) {
        option.classList.add('active');
      } else {
        option.classList.remove('active');
      }
    });
    console.log('🎨 Theme set to:', themeName);
  }

  function loadTheme() {
    const savedTheme = localStorage.getItem('selectedTheme') || 'knight';
    setTheme(savedTheme);
  }

  function calculateDailyRPE() {
    const rpeSections = document.querySelectorAll('[data-rpe-section]');
    rpeSections.forEach(section => {
      const inputs = section.querySelectorAll('input[placeholder="/10"]');
      const totalInput = section.querySelector('input[placeholder="/50"]');
      if (totalInput && inputs.length === 5) {
        let total = 0;
        inputs.forEach(input => {
          let value = parseInt(input.value);
          if (isNaN(value) || value < 1) {
            value = 0;
          } else if (value > 10) {
            value = 10;
            input.value = 10;
          }
          total += value;
        });
        totalInput.value = total;
      }
    });
  }

  function getThemeColors() {
    const theme = document.body.getAttribute('data-theme');
    const colorMap = {
      'knight': '#0a0a0a',
      'stealth': '#1a1a1a',
      'bronze': '#0f1923',
      'crimson': '#0d0d0d',
      'arctic': '#0a1628',
    };
    return colorMap[theme] || '#0a0a0a';
  }

  function exportPDF() {
    console.log('[v0] Starting PDF export...');
    
    // Check if html2pdf is loaded
    if (typeof html2pdf === 'undefined') {
      console.error('[v0] html2pdf library not loaded!');
      alert('PDF library not loaded. Please refresh the page and try again.');
      return;
    }
    
    console.log('[v0] html2pdf library is loaded:', typeof html2pdf);
    
    const element = document.getElementById('planner-content');
    if (!element) {
      console.error('[v0] Could not find planner-content element!');
      alert('Could not find planner content. Please refresh the page.');
      return;
    }
    
    const pages = document.querySelectorAll('.page');
    console.log('[v0] Found', pages.length, 'pages to export');
    
    const computedBg = getThemeColors();
    
    console.log('[v0] Hiding control buttons...');
    document.querySelectorAll('.control-buttons, .theme-switcher').forEach(el => el.style.display = 'none');
    
    console.log('[v0] Cloning element and converting inputs to text...');
    const clonedElement = element.cloneNode(true);
    
    // Convert all inputs to plain text divs
    clonedElement.querySelectorAll('input[type="text"], input[type="number"]').forEach(input => {
      const textDiv = document.createElement('div');
      textDiv.textContent = input.value || input.placeholder || '';
      textDiv.style.cssText = 'padding: 0.5rem; min-height: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.1);';
      input.parentNode.replaceChild(textDiv, input);
    });
    
    // Convert all textareas to plain text divs
    clonedElement.querySelectorAll('textarea').forEach(textarea => {
      const textDiv = document.createElement('div');
      textDiv.textContent = textarea.value || textarea.placeholder || '';
      textDiv.style.cssText = 'padding: 0.5rem; min-height: 3rem; white-space: pre-wrap; border: 1px solid rgba(255,255,255,0.1);';
      textarea.parentNode.replaceChild(textDiv, textarea);
    });
    
    // Convert checkboxes to visual indicators
    clonedElement.querySelectorAll('.checkbox').forEach(checkbox => {
      const isChecked = checkbox.classList.contains('checked');
      checkbox.textContent = isChecked ? '✓' : '○';
      checkbox.style.cssText = 'display: inline-block; width: 20px; height: 20px; text-align: center; line-height: 20px; border: 2px solid var(--accent-primary); border-radius: 4px;';
    });
    
    console.log('[v0] Applying PDF export styles to cloned element...');
    clonedElement.querySelectorAll('.page').forEach(p => {
      p.style.cssText = \`background: \${computedBg} !important; border: none !important; page-break-after: always;\`;
      p.classList.add('pdf-export-mode');
    });
    clonedElement.classList.add('pdf-export-mode');
    
    // Create a temporary container for the cloned element
    const tempContainer = document.createElement('div');
    tempContainer.style.cssText = 'position: absolute; left: -9999px; top: 0;';
    tempContainer.appendChild(clonedElement);
    document.body.appendChild(tempContainer);
    
    console.log('[v0] Temporary container created with cloned content');
    
    const restoreStyles = () => {
      console.log('[v0] Cleaning up...');
      document.querySelectorAll('.control-buttons, .theme-switcher').forEach(el => el.style.display = 'flex');
      if (tempContainer && tempContainer.parentNode) {
        tempContainer.parentNode.removeChild(tempContainer);
      }
    };
    
    const opt = {
      margin: 0.5,
      filename: \`Return_to_Form_Fused_Ultimate_Edition_\${PLANNED_WEEKS}Weeks.pdf\`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        logging: false, 
        dpi: 192, 
        letterRendering: true,
        useCORS: true,
        allowTaint: true,
        backgroundColor: computedBg,
      },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };
    
    console.log('[v0] Generating PDF...');
    
    try {
      html2pdf()
        .set(opt)
        .from(clonedElement)
        .outputPdf('blob')
        .then((pdfBlob) => {
          console.log('[v0] PDF blob generated, size:', pdfBlob.size, 'bytes');
          
          const url = URL.createObjectURL(pdfBlob);
          console.log('[v0] Blob URL created:', url);
          
          const link = document.createElement('a');
          link.href = url;
          link.download = opt.filename;
          
          // Make sure the link is visible and clickable
          link.style.cssText = 'position: fixed; top: 0; left: 0; z-index: 9999;';
          document.body.appendChild(link);
          console.log('[v0] Download link added to DOM');
          
          // Try multiple download methods for better compatibility
          console.log('[v0] Attempting download...');
          
          // Method 1: Direct click
          link.click();
          console.log('[v0] Click triggered');
          
          // Method 2: Programmatic click event (fallback)
          setTimeout(() => {
            const clickEvent = new MouseEvent('click', {
              view: window,
              bubbles: true,
              cancelable: true
            });
            link.dispatchEvent(clickEvent);
            console.log('[v0] Fallback click event dispatched');
          }, 100);
          
          // Cleanup after sufficient time for download to start
          setTimeout(() => {
            if (link.parentNode) {
              document.body.removeChild(link);
            }
            URL.revokeObjectURL(url);
            console.log('[v0] Download link cleaned up');
          }, 3000); // Increased timeout from 100ms to 3000ms
          
          console.log('[v0] PDF download initiated successfully!');
          alert('PDF download started! Check your downloads folder. The file is: ' + opt.filename);
          restoreStyles();
        })
        .catch(error => {
          console.error('[v0] PDF Export Failed:', error);
          console.error('[v0] Error message:', error.message);
          console.error('[v0] Error stack:', error.stack);
          alert('PDF export failed: ' + error.message + '. Check console for details.');
          restoreStyles();
        });
    } catch (error) {
      console.error('[v0] Exception during PDF export:', error);
      console.error('[v0] Error message:', error.message);
      console.error('[v0] Error stack:', error.stack);
      alert('PDF export failed with exception: ' + error.message);
      restoreStyles();
    }
  }
  window.exportPDF = exportPDF;

  function initializePlanner() {
    console.log('🦇 Return to Form Fused Ultimate Edition Loading...');
    loadTheme();
    generateWeeklyLogs();
    generateEndPages();
    const pageElements = document.querySelectorAll('.page');
    const totalPages = pageElements.length;
    pageElements.forEach((page, index) => {
      const pageNumElement = page.querySelector('.page-number');
      if (pageNumElement) {
        pageNumElement.textContent = \`PAGE \${index + 1} / \${totalPages}\`;
      }
      if (!page.id) {
        page.id = \`page-\${index + 1}\`;
      }
    });
    generateTOC();
    loadProgress();
    document.querySelectorAll('.theme-option').forEach(option => {
      option.addEventListener('click', () => {
        setTheme(option.dataset.theme);
      });
    });
    document.addEventListener('input', function(e) {
      if (e.target.classList.contains('daily-rpe-input')) {
        calculateDailyRPE();
        saveProgress();
      } else if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        saveProgress();
      }
    });
    setInterval(saveProgress, 30000);
    window.addEventListener('beforeprint', function() {
      document.querySelectorAll('.control-buttons, .theme-switcher').forEach(el => el.style.display = 'none');
    });
    window.addEventListener('afterprint', function() {
      document.querySelectorAll('.control-buttons, .theme-switcher').forEach(el => el.style.display = 'flex');
    });
    document.addEventListener('keydown', function(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        window.print();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveProgress();
      }
    });
    console.log('✅ Loaded:', totalPages, 'pages');
    console.log('💾 Autosave: Every 30 seconds');
    console.log('⌨️  Shortcuts: Ctrl+P (Print), Ctrl+S (Save)');
    console.log('🎨 Theme:', document.body.getAttribute('data-theme'));
    console.log('%c🦇 RETURN TO FORM: FUSED ULTIMATE EDITION 🦇', 'font-size: 20px; font-weight: bold; color: #d4af37;');
    console.log('%c157+ Pages | 5 Themes | Auto-RPE Calc | Autosave | PDF Export Ready', 'font-size: 14px; color: #8b9dc3;');
  }
  window.initializePlanner = initializePlanner;
`

export default function PlannerPage() {
  useEffect(() => {
    // Initialize planner after component mounts
    if (typeof window !== "undefined") {
      window.initializePlanner()
    }
  }, [])

  return (
    <>
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"
        strategy="afterInteractive"
      />

      <div className="control-buttons">
        <button className="control-btn" onClick={() => window.print()}>
          🖨️ PRINT
        </button>
        <button className="control-btn" onClick={() => window.exportPDF()}>
          💾 EXPORT PDF
        </button>
        <button
          className="control-btn"
          data-save-btn="true"
          onClick={() => window.saveProgress()}
          style={{ background: "linear-gradient(135deg, #4CAF50 0%, #45a049 100%)" }}
        >
          💿 SAVE DATA
        </button>
      </div>

      <div className="theme-switcher">
        <h4>⚔️ THEME</h4>
        <div className="theme-option active" data-theme="knight">
          <div
            className="theme-color-preview"
            style={{ background: "linear-gradient(135deg, #d4af37 0%, #8b9dc3 100%)" }}
          ></div>
          <div className="theme-name">Dark Knight</div>
        </div>
        <div className="theme-option" data-theme="stealth">
          <div
            className="theme-color-preview"
            style={{ background: "linear-gradient(135deg, #39ff14 0%, #4a4a4a 100%)" }}
          ></div>
          <div className="theme-name">Stealth Ops</div>
        </div>
        <div className="theme-option" data-theme="bronze">
          <div
            className="theme-color-preview"
            style={{ background: "linear-gradient(135deg, #cd7f32 0%, #f5f5dc 100%)" }}
          ></div>
          <div className="theme-name">Bronze Elite</div>
        </div>
        <div className="theme-option" data-theme="crimson">
          <div
            className="theme-color-preview"
            style={{ background: "linear-gradient(135deg, #dc143c 0%, #ff6347 100%)" }}
          ></div>
          <div className="theme-name">Crimson War</div>
        </div>
        <div className="theme-option" data-theme="arctic">
          <div
            className="theme-color-preview"
            style={{ background: "linear-gradient(135deg, #00d4ff 0%, #4169e1 100%)" }}
          ></div>
          <div className="theme-name">Arctic Force</div>
        </div>
      </div>

      <div className="planner-container" id="planner-content">
        <div className="page cover-page" id="page-1">
          <div className="cover-title">
            RETURN
            <br />
            TO FORM
          </div>
          <div className="cover-subtitle">THE ULTIMATE DISCIPLINE SYSTEM</div>
          <div className="cover-tagline">
            157 Pages • 5 Themes • Science-Backed Training
            <br />
            <span className="gold-accent">Transform Your Body. Master Your Mind. Own Your Life.</span>
          </div>
          <div style={{ marginTop: "3rem", fontSize: "0.9rem", opacity: 0.5, letterSpacing: "2px" }}>
            ULTIMATE EDITION • VERSION 3.0 • INTERACTIVE
          </div>
        </div>

        <div className="page" id="command-center">
          <h1>⚔️ COMMAND CENTER</h1>
          <h2>Your Mission Briefing</h2>
          <p style={{ marginBottom: "2rem", fontSize: "1.1rem", color: "var(--text-secondary)" }}>
            157+ pages of battle-tested systems. Click any section to navigate instantly.
          </p>

          <div className="navigation"></div>

          <h1 style={{ marginTop: "3rem" }}>🔥 CORE SYSTEMS</h1>

          <div className="goal-section">
            <h3>Primary Goal Focus</h3>
            <textarea
              className="input-field"
              data-type="input"
              data-id="main-goal-1"
              placeholder="Define your ultimate purpose for this 12-week challenge..."
            ></textarea>
            <h3>Secondary Metric (e.g., Weight, Lift PR, Time)</h3>
            <input
              type="text"
              className="input-field"
              data-type="input"
              data-id="secondary-metric-1"
              placeholder="Starting Value (e.g., 200 lbs / 225kg Bench / 7 min mile)"
            />
            <input
              type="text"
              className="input-field"
              data-type="input"
              data-id="secondary-metric-2"
              placeholder="Target Value"
            />
          </div>
        </div>

        <div className="page" id="core-metrics">
          <h1>📊 CORE METRICS</h1>
          <h2>Tracking Your Transformation</h2>

          <div className="measurement-grid">
            <div className="measure-header">Measurement</div>
            <div className="measure-header">Start (Week 1)</div>
            <div className="measure-header">Final (Week 12)</div>

            <div className="measure-cell">Weight (lbs/kg)</div>
            <div className="measure-cell">
              <input
                type="text"
                className="input-field"
                data-type="input"
                data-id="m-weight-start"
                placeholder="e.g., 200"
              />
            </div>
            <div className="measure-cell">
              <input
                type="text"
                className="input-field"
                data-type="input"
                data-id="m-weight-end"
                placeholder="e.g., 185"
              />
            </div>

            <div className="measure-cell">Waist (inches/cm)</div>
            <div className="measure-cell">
              <input
                type="text"
                className="input-field"
                data-type="input"
                data-id="m-waist-start"
                placeholder="e.g., 34"
              />
            </div>
            <div className="measure-cell">
              <input
                type="text"
                className="input-field"
                data-type="input"
                data-id="m-waist-end"
                placeholder="e.g., 32"
              />
            </div>

            <div className="measure-cell">Arms (inches/cm)</div>
            <div className="measure-cell">
              <input
                type="text"
                className="input-field"
                data-type="input"
                data-id="m-arms-start"
                placeholder="e.g., 15"
              />
            </div>
            <div className="measure-cell">
              <input
                type="text"
                className="input-field"
                data-type="input"
                data-id="m-arms-end"
                placeholder="e.g., 16"
              />
            </div>

            <div className="measure-cell">Chest (inches/cm)</div>
            <div className="measure-cell">
              <input
                type="text"
                className="input-field"
                data-type="input"
                data-id="m-chest-start"
                placeholder="e.g., 40"
              />
            </div>
            <div className="measure-cell">
              <input
                type="text"
                className="input-field"
                data-type="input"
                data-id="m-chest-end"
                placeholder="e.g., 42"
              />
            </div>

            <div className="measure-cell">Shoulders (inches/cm)</div>
            <div className="measure-cell">
              <input
                type="text"
                className="input-field"
                data-type="input"
                data-id="m-shoulders-start"
                placeholder="e.g., 48"
              />
            </div>
            <div className="measure-cell">
              <input
                type="text"
                className="input-field"
                data-type="input"
                data-id="m-shoulders-end"
                placeholder="e.g., 50"
              />
            </div>
          </div>

          <h2>Progress Photos</h2>
          <div className="progress-photos">
            <div className="photo-box">START PHOTO (FRONT/BACK/SIDE)</div>
            <div className="photo-box">END PHOTO (FRONT/BACK/SIDE)</div>
          </div>

          <h2>Your Vision Board</h2>
          <div className="vision-board">
            <div className="vision-box">INSPIRATION 1</div>
            <div className="vision-box">INSPIRATION 2</div>
            <div className="vision-box">INSPIRATION 3</div>
            <div className="vision-box">KEY QUOTE/MANTRA</div>
            <div className="vision-box">REWARD FOR COMPLETION</div>
            <div className="vision-box">WHAT&apos;S AT STAKE? (The Cost of Quitting)</div>
          </div>
        </div>

        <div className="page" id="rpe-scale-reference">
          <h1>🔥 RPE SCALE REFERENCE</h1>
          <p style={{ fontSize: "1.1rem", color: "var(--text-secondary)", marginBottom: "2rem" }}>
            Rate of Perceived Exertion (RPE) helps track workout intensity and fatigue.
          </p>

          <div className="rpe-scale">
            <div className="rpe-item" style={{ background: "rgba(220, 20, 60, 0.2)" }}>
              <strong>10</strong>
              Failure / Max Effort. Cannot do another rep.
            </div>
            <div className="rpe-item" style={{ background: "rgba(255, 165, 0, 0.2)" }}>
              <strong>9</strong>
              Very Hard. 1 Rep left in the tank.
            </div>
            <div className="rpe-item" style={{ background: "rgba(255, 255, 0, 0.2)" }}>
              <strong>8</strong>
              Hard. 2 Reps left in the tank.
            </div>
            <div className="rpe-item" style={{ background: "rgba(0, 128, 0, 0.2)" }}>
              <strong>7</strong>
              Moderate. Could do 3+ Reps. Warm-up weight.
            </div>
            <div className="rpe-item" style={{ background: "rgba(0, 0, 255, 0.2)" }}>
              <strong>6-</strong>
              Easy. Warm-up, cardio, or skill work.
            </div>
          </div>

          <div className="quote-box">
            &quot;Intensity is the price of admission. Consistency is the cost of victory.&quot;
          </div>

          <h2 style={{ marginTop: "3rem" }}>Daily RPE Auto-Calculation System</h2>
          <p style={{ fontSize: "1.1rem", color: "var(--text-secondary)", marginBottom: "2rem" }}>
            This system automatically sums your daily performance scores (1-10) to give you a weekly metric.
          </p>

          <div className="goal-section" data-rpe-section>
            <h3>Daily RPE Metrics (1-10 Score)</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "1rem" }}>
              <div
                style={{ gridColumn: "span 1", fontWeight: 700, color: "var(--accent-primary)", letterSpacing: "1px" }}
              >
                METRIC
              </div>
              <div
                style={{ gridColumn: "span 1", fontWeight: 700, color: "var(--accent-primary)", letterSpacing: "1px" }}
              >
                SCORE (1-10)
              </div>
              <div style={{ gridColumn: "span 4" }}></div>

              <div style={{ gridColumn: "span 1" }}>Workout Intensity:</div>
              <div style={{ gridColumn: "span 1" }}>
                <input
                  type="number"
                  min="1"
                  max="10"
                  className="input-field daily-rpe-input"
                  placeholder="/10"
                  data-type="input"
                  data-id="rpe-workout"
                />
              </div>
              <div style={{ gridColumn: "span 4", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                (E.g., How hard was your main training session?)
              </div>

              <div style={{ gridColumn: "span 1" }}>Nutrition Adherence:</div>
              <div style={{ gridColumn: "span 1" }}>
                <input
                  type="number"
                  min="1"
                  max="10"
                  className="input-field daily-rpe-input"
                  placeholder="/10"
                  data-type="input"
                  data-id="rpe-nutrition"
                />
              </div>
              <div style={{ gridColumn: "span 4", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                (How closely did you stick to your diet/macros?)
              </div>

              <div style={{ gridColumn: "span 1" }}>Sleep Quality:</div>
              <div style={{ gridColumn: "span 1" }}>
                <input
                  type="number"
                  min="1"
                  max="10"
                  className="input-field daily-rpe-input"
                  placeholder="/10"
                  data-type="input"
                  data-id="rpe-sleep"
                />
              </div>
              <div style={{ gridColumn: "span 4", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                (Did you hit your sleep target and wake up rested?)
              </div>

              <div style={{ gridColumn: "span 1" }}>Hydration/Supplements:</div>
              <div style={{ gridColumn: "span 1" }}>
                <input
                  type="number"
                  min="1"
                  max="10"
                  className="input-field daily-rpe-input"
                  placeholder="/10"
                  data-type="input"
                  data-id="rpe-hydration"
                />
              </div>
              <div style={{ gridColumn: "span 4", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                (Water intake, vitamin/supplement consistency)
              </div>

              <div style={{ gridColumn: "span 1" }}>Mindset/Focus:</div>
              <div style={{ gridColumn: "span 1" }}>
                <input
                  type="number"
                  min="1"
                  max="10"
                  className="input-field daily-rpe-input"
                  placeholder="/10"
                  data-type="input"
                  data-id="rpe-mindset"
                />
              </div>
              <div style={{ gridColumn: "span 4", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                (Mental clarity, stress management, discipline)
              </div>
            </div>

            <div
              style={{
                marginTop: "1.5rem",
                borderTop: "2px solid var(--accent-primary)",
                paddingTop: "1rem",
                display: "grid",
                gridTemplateColumns: "repeat(6, 1fr)",
                gap: "1rem",
              }}
            >
              <div style={{ gridColumn: "span 1", fontWeight: 700, color: "var(--accent-secondary)" }}>
                TOTAL DAILY RPE (Max 50)
              </div>
              <div style={{ gridColumn: "span 1" }}>
                <input
                  type="text"
                  className="input-field"
                  placeholder="/50"
                  readOnly
                  data-type="input"
                  data-id="rpe-total"
                  style={{
                    color: "var(--accent-primary)",
                    fontWeight: 700,
                    background: "var(--primary-bg)",
                    textAlign: "center",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <Script id="planner-logic" strategy="afterInteractive">
        {plannerLogic}
      </Script>
    </>
  )
}
