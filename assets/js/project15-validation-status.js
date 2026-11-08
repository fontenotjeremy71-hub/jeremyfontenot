/* Public read-only workflow status. Never includes local execution or credentials. */
(()=>{'use strict';
const base='https://api.github.com/repos/fontenotjeremy71-hub/jeremyfontenot/actions/workflows/';
const workflows=[['validation.yml','jf-repo-run'],['production-verification.yml','jf-prod-run']];
const states={success:'Passed',failure:'Failed',cancelled:'Failed',timed_out:'Failed',action_required:'Unknown',skipped:'Unknown',neutral:'Unknown'};
const format=t=>t?new Date(t).toLocaleString():'Unavailable';
async function load(file,id){const node=document.getElementById(id);if(!node)return;
try{const response=await fetch(base+encodeURIComponent(file)+'/runs?per_page=30',{headers:{Accept:'application/vnd.github+json'},cache:'no-store'});
if(!response.ok)throw Error('HTTP '+response.status);const data=await response.json();const runs=Array.isArray(data.workflow_runs)?data.workflow_runs:[];const latest=runs[0];if(!latest){node.textContent='Unknown — no workflow runs returned.';return;}
const state=latest.status==='completed'?(states[latest.conclusion]||'Unknown'):'Running';const success=runs.find(r=>r.status==='completed'&&r.conclusion==='success');node.replaceChildren();
const summary=document.createElement('span');summary.textContent='Latest: '+state+' · '+format(latest.updated_at)+' · '+(latest.head_sha||'').slice(0,7);node.append(summary,document.createElement('br'));
const link=document.createElement('a');link.href=latest.html_url;link.rel='noopener noreferrer';link.target='_blank';link.textContent='View latest run ↗';node.append(link,document.createElement('br'));
const previous=document.createElement('span');previous.textContent='Most recent pass: '+(success?format(success.updated_at):'Not found in recent runs');node.append(previous);
}catch(error){node.textContent='Data unavailable — unable to verify GitHub Actions status ('+error.message+').';}}
Promise.all(workflows.map(([file,id])=>load(file,id))).then(()=>{const node=document.getElementById('jf-status-updated');if(node)node.append(' Checked: '+new Date().toLocaleString()+'.');});
})();
