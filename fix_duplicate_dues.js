const { list, remove } = require('./server/db');

async function fixDues() {
  try {
    const allFees = await list('fees');
    const allDues = await list('dueManagement');
    
    console.log(`Analyzing ${allDues.length} dues against ${allFees.length} fee slips...`);

    let deletedCount = 0;

    for (const due of allDues) {
      if (due.particulars.startsWith("Tuition fee of")) {
        const month = due.particulars.replace("Tuition fee of ", "");
        const session = "26-27";
        
        if (due.session !== session) continue;

        // Find if any PAID slip exists for this student and month
        const isPaid = allFees.find(f => 
          f.admissionNo === due.admissionNo && 
          f.status === "Paid" && 
          String(f.month || "").includes(month)
        );

        if (isPaid) {
          console.log(`[FIX] Student ${due.studentName} (${due.admissionNo}) already paid for ${month}. Deleting extra due ID ${due.id}.`);
          await remove('dueManagement', due.id);
          deletedCount++;
        }
      }
    }
    
    console.log(`Cleanup finished. Deleted ${deletedCount} redundant due records.`);
    process.exit(0);
  } catch (err) {
    console.error("Fix failed:", err);
    process.exit(1);
  }
}

fixDues();
