/**
 * start.js — Sunucuyu güvenli şekilde başlatır.
 * Port 3000 doluysa otomatik öldürür, sonra başlatır.
 */
const { execSync, spawn } = require('child_process');
const PORT = process.env.PORT || 3000;

function killPort(port) {
  try {
    // netstat ile port'u kullanan PID'leri bul
    const output = execSync(`netstat -aon 2>nul`).toString();
    const lines = output.split('\n');
    const pids = new Set();

    for (const line of lines) {
      // Sadece LISTENING veya ESTABLISHED :PORT satırlarını al
      if (line.includes(`:${port} `) && (line.includes('LISTENING') || line.includes('ESTABLISHED'))) {
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        if (pid && pid !== '0' && /^\d+$/.test(pid)) {
          pids.add(pid);
        }
      }
    }

    if (pids.size === 0) {
      console.log(`✅ Port ${port} serbest.`);
      return;
    }

    for (const pid of pids) {
      try {
        execSync(`taskkill /F /PID ${pid} 2>nul`);
        console.log(`🔪 PID ${pid} durduruldu (port ${port} boşaltıldı).`);
      } catch {
        // PID zaten ölmüş olabilir, devam et
      }
    }

    // Kısa bekle
    execSync('ping 127.0.0.1 -n 2 >nul');
    console.log(`✅ Port ${port} temizlendi.`);
  } catch (err) {
    console.log(`⚠️  Port temizleme uyarısı: ${err.message}`);
  }
}

// Port'u temizle
killPort(PORT);

// Sunucuyu başlat
console.log(`\n🚀 Sunucu başlatılıyor (port ${PORT})...\n`);
const child = spawn(process.execPath, ['src/index.js'], {
  stdio: 'inherit',
  env: { ...process.env }
});

child.on('error', err => {
  console.error('❌ Başlatma hatası:', err.message);
  process.exit(1);
});

child.on('exit', code => {
  if (code !== 0) process.exit(code);
});

// Ctrl+C ile temiz kapat
process.on('SIGINT', () => { child.kill('SIGINT'); process.exit(0); });
process.on('SIGTERM', () => { child.kill('SIGTERM'); process.exit(0); });
