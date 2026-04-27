(function() {
  window.sendWhatsAppFeeSlip = async function(feeId) {
    alert("NEW CACHE CLEARED v6");
    const store = getStore();
    const rawF = (store.fees || []).find(x => Number(x.id) === Number(feeId));
    if (!rawF) return showToast("Fee record not found", "error");

    const f = JSON.parse(JSON.stringify(rawF));

    const container = document.createElement("div");
    container.style.cssText = "position:absolute; left:-9999px; top:0; width:450px; background:#fff; padding:20px; z-index:-1000;";
    document.body.appendChild(container);

    const student = (store.students || []).find(s => s.fullName === f.studentName || s.admissionNo === f.admissionNo);
    if (student) {
      if (!f.admissionNo) f.admissionNo = student.admissionNo || "";
      if (!f.fatherName) f.fatherName = student.parentName || "";
      if (!f.phone) f.phone = student.phone || "";
      if (!f.rollNo) f.rollNo = student.rollNo || student.roll || "";
    }

    const schoolName = "Tapowan Public School";
    const slipNo = "FS-" + (f.id || Date.now());
    const printDate = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    const totalFee = parseFloat(f.totalFee) || 0;
    const paidAmount = parseFloat(f.paidAmount) || 0;
    const balance = parseFloat(f.balance) || Math.max(0, totalFee - paidAmount);
    const statusColor = String(f.status || "").toLowerCase() === "paid" ? "#16a34a" : String(f.status || "").toLowerCase() === "partial" ? "#d97706" : "#dc2626";
    const statusBg = String(f.status || "").toLowerCase() === "paid" ? "#dcfce7" : String(f.status || "").toLowerCase() === "partial" ? "#fef3c7" : "#fee2e2";

    let feeRows = "";
    const SLIP_FEE_TYPES = [
      { key: "tuitionFee",     label: "Tuition Fee",     icon: "📚" },
      { key: "admissionFee",   label: "Admission Fee",   icon: "🎓" },
      { key: "computerFee",    label: "Computer Fee",    icon: "💻" },
      { key: "developmentFee", label: "Development Fee", icon: "🏗️" },
      { key: "labFee",         label: "Lab Fee",         icon: "🔬" },
      { key: "sportsFee",      label: "Sports Fee",      icon: "⚽" },
      { key: "libraryFee",     label: "Library Fee",     icon: "📖" },
      { key: "examFee",        label: "Exam Fee",        icon: "📝" },
      { key: "lateFee",        label: "Late Fee",        icon: "⏰" },
      { key: "otherFee",       label: "Other Fee",       icon: "➕" }
    ];

    SLIP_FEE_TYPES.forEach(({ key, label, icon }, idx) => {
      const amt = parseFloat(f[key]) || 0;
      if (amt > 0) {
        const bg = idx % 2 === 0 ? "#f9fafb" : "#ffffff";
        const mSuffix = f.month ? ` (${f.month})` : "";
        feeRows += `<tr style="background:${bg};"><td style="padding:5px 8px;border-bottom:1px solid #e5e7eb;font-size:12px;color:#475569;font-weight:700;">${icon} ${label}${mSuffix}</td><td style="padding:5px 8px;border-bottom:1px solid #e5e7eb;text-align:right;font-size:12px;font-weight:800;color:#1e293b;">₹ ${amt.toLocaleString("en-IN")}</td></tr>`;
      }
    });

    try {
      const bdIds = JSON.parse(f.selectedBookIds || "[]");
      if (bdIds.length) {
        const allBD = [...(store.booksAndDress || [])];
        bdIds.forEach(id => {
          const item = allBD.find(i => String(i.id) === String(id));
          if (item) {
            feeRows += `<tr style="background:#f0f4ff;"><td style="padding:5px 8px;border-bottom:1px solid #e5e7eb;font-size:12px;color:#475569;font-weight:700;">${item.itemType === "Book" ? "📚" : "👕"} ${item.itemName}</td><td style="padding:5px 8px;border-bottom:1px solid #e5e7eb;text-align:right;font-size:12px;font-weight:800;color:#1e293b;">₹ ${item.price.toLocaleString("en-IN")}</td></tr>`;
          }
        });
      }
    } catch(e) {}

    container.innerHTML = `
    <div style="width:400px;display:flex;flex-direction:column;font-family:Arial,sans-serif;font-size:12px;border:1.5px solid #1e3a8a;border-radius:6px;box-sizing:border-box;background:#fff;padding:0;">
      <div style="border-bottom:2px solid #1e3a8a;padding:15px 5px;text-align:center;">
        <div style="display:flex;align-items:center;justify-content:center;gap:8px;">
          <img src="logo.png" style="height:42px;object-fit:contain;" alt="Logo" />
          <div style="font-size:18px;font-weight:900;color:#1e3a8a;letter-spacing:0.5px;text-transform:uppercase;">${schoolName}</div>
        </div>
        <div style="font-size:11px;color:#1e3a8a;margin-top:1px;font-weight:700;">Prem Nagar Tapin North, Ramgarh(JH)</div>
        <div style="margin-top:6px;display:inline-block;background:#1e3a8a;color:#fff;padding:6px 18px;font-size:12px;font-weight:800;text-transform:uppercase;border-radius:2px;">FEE SLIP</div>
      </div>
      <div style="display:flex;justify-content:space-between;padding:6px 10px;background:#eef2ff;border-bottom:1px solid #c7d2fe;font-size:11px;color:#1e3a8a;font-weight:700;">
        <span><strong>No:</strong> ${slipNo}</span>
        <span><strong>Term:</strong> ${f.term || "-"}</span>
        <span><strong>Date:</strong> ${printDate}</span>
      </div>
      <div style="padding:10px 12px;border-bottom:1px solid #e5e7eb;">
        <table style="width:100%;border-collapse:collapse;font-size:12px;">
          <tr>
            <td style="color:#64748b;width:25%;padding:3px 0;font-weight:700;">Name</td>
            <td style="font-weight:800;color:#1e293b;padding:3px 0;">${f.studentName || "-"}</td>
            <td style="color:#64748b;width:15%;padding:3px 0 3px 8px;font-weight:700;">Adm.No</td>
            <td style="font-weight:800;color:#1e293b;padding:3px 0;">${f.admissionNo || "-"}</td>
          </tr>
          <tr>
            <td style="color:#64748b;padding:3px 0;font-weight:700;">Father</td>
            <td style="font-weight:800;color:#1e293b;padding:3px 0;">${f.fatherName || "-"}</td>
            <td style="color:#64748b;padding:3px 0 3px 8px;font-weight:700;">Class</td>
            <td style="font-weight:800;color:#1e293b;padding:3px 0;">${f.className || "-"}</td>
          </tr>
          <tr>
            <td style="color:#64748b;padding:3px 0;font-weight:700;">Roll</td>
            <td style="font-weight:800;color:#1e293b;padding:3px 0;">${f.rollNo || "-"}</td>
            <td style="color:#64748b;padding:3px 0 3px 8px;font-weight:700;">Method</td>
            <td style="font-weight:800;color:#1e293b;padding:3px 0;">${f.paymentMethod || "-"}</td>
          </tr>
          <tr>
            <td style="color:#64748b;padding:4px 0 2px;font-weight:700;">Status</td>
            <td colspan="3" style="padding:4px 0;"><span style="background:${statusBg};color:${statusColor};font-weight:800;padding:2px 10px;border-radius:4px;font-size:11px;border:1px solid ${statusColor};">${(f.status || "Pending").toUpperCase()}</span></td>
          </tr>
        </table>
      </div>
      <div style="padding:8px 12px;border-bottom:1px solid #e5e7eb;flex:1;">
        <div style="font-size:11px;font-weight:900;color:#000;text-transform:uppercase;margin-bottom:6px;">Fee Details</div>
        <table style="width:100%;border-collapse:collapse;">
          <thead>
            <tr style="background:#1e3a8a;color:#fff;">
              <th style="padding:6px 8px;text-align:left;font-size:11px;font-weight:700;">Description</th>
              <th style="padding:6px 8px;text-align:right;font-size:11px;font-weight:700;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${feeRows || `<tr><td colspan="2" style="padding:15px;color:#000000;text-align:center;font-size:12px;font-weight:700;">No details</td></tr>`}
          </tbody>
        </table>
      </div>
      <div style="padding:12px;background:#f8fafc;border-top:1px solid #e2e8f0;display:flex;align-items:center;gap:15px;">
        <!-- QR Code Column -->
        <div style="width:65px;height:65px;background:#fff;padding:3px;display:flex;align-items:center;justify-content:center;border:1px solid #e5e7eb;">
          <img src="qr.png" style="width:100%;height:100%;object-fit:contain;" alt="Payment QR" />
        </div>
        <!-- Totals Column -->
        <div style="flex:1;font-size:13px;">
          <div style="display:flex;justify-content:space-between;margin-bottom:5px;">
            <span style="color:#000000;font-weight:800;">Total Fee</span>
            <span style="font-weight:900;color:#000000;">₹ ${totalFee.toLocaleString("en-IN")}</span>
          </div>
          <div style="display:flex;justify-content:space-between;margin-bottom:5px;">
            <span style="color:#16a34a;font-weight:800;">Paid</span>
            <span style="font-weight:900;color:#16a34a;">₹ ${paidAmount.toLocaleString("en-IN")}</span>
          </div>
            <div style="display:flex;justify-content:space-between;">
            <span style="color:#dc2626;font-weight:800;">Balance</span>
            <span style="font-weight:900;color:#dc2626;">₹ ${balance.toLocaleString("en-IN")}</span>
          </div>
        </div>
      </div>
      <div style="padding:5px 15px 15px;display:flex;justify-content:space-between;font-size:11px;color:#000;">
        <div style="text-align:center;width:45%;"><div style="border-top:1px solid #000;margin-top:20px;padding-top:4px;font-weight:700;">Parent</div></div>
        <div style="text-align:center;width:45%;"><div style="border-top:1px solid #000;margin-top:20px;padding-top:4px;font-weight:700;">Cashier</div></div>
      </div>
    </div>
    `;

    showToast(`📸 Generating Formal Slip for ${f.studentName}...`, "info");

    try {
      await new Promise(r => setTimeout(r, 400));
      const canvas = await html2canvas(container, {
        scale: 5,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false
      });
      document.body.removeChild(container);
      canvas.toBlob(async (blob) => {
        const fileName = `Fee_Slip_${f.studentName || 'Student'}.png`;
        try {
          if (navigator.clipboard && window.ClipboardItem) {
            await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
            showToast(`✅ Slip for ${f.studentName} COPIED! Ready to Paste.`, "success");
          } else {
            throw new Error("Clipboard API not available");
          }
        } catch (clipErr) {
          console.warn("Clipboard failed, using download fallback", clipErr);
          // Fallback: Download the file automatically
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = fileName;
          link.click();
          URL.revokeObjectURL(url);
          showToast(`💾 Slip saved to Downloads. Please attach it in WhatsApp.`, "warning");
        }
        openWhatsApp(f.phone || student?.phone, `Hello! Attached is the Digital Fee Slip for *${f.studentName}*.`);
      }, 'image/png');
    } catch (err) {
      if (container.parentNode) document.body.removeChild(container);
      showToast("❌ Generation failed.", "error");
    }
  };
})();
