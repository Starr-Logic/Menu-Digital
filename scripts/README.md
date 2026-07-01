# 🛠️ Scripts Guide (How to use)

folder nis phtuk scripts smrab juoy oy bng-p'oun ot pol pipak type commands veang ๆ. brer scripts tang nis deumbey run, install, ning thver-kar jeamuoy github.

## 📁 jek tam OS
- **Linux/Mac**: choul tv knong `linux/` (brer file `.sh`)
- **Windows**: choul tv knong `windows/` (brer file `.bat`)

---

## 🚀 rberb brer smrab Linux/Mac
bverk terminal nv knong folder root rbs project (Menu-Digital) rouch gvyl:

1. **Install library / Node modules** (brer pel choul project dmbong):
   ```bash
   ./scripts/linux/install.sh
   ```

2. **Run project locally** (bverk tv merl nv browser):
   ```bash
   ./scripts/linux/dev.sh
   ```

3. **Pull code pi GitHub** (tuht yk code thmeyໆ del ke thver hxx mk local):
   ```bash
   ./scripts/linux/pull.sh
   ```

4. **Push code tv GitHub** (save kngar rbs kloun eng hz banh-joun tv github):
   ```bash
   ./scripts/linux/git-push.sh "sraser bnyol pi code del tver ti nis"
   ```

5. **Sync Code (Pull + Push)** (su-vat-thi-pheap! vea neng save code local, pull code thmey mok, hz push tv vinh jea auto):
   ```bash
   ./scripts/linux/git-sync.sh "sraser bnyol pi code del tver ti nis"
   ```

---

## 🪟 rberb brer smrab Windows
bverk CMD ryy PowerShell nv knong folder root rbs project (Menu-Digital) rouch gvyl:

1. **Install library**:
   ```cmd
   .\scripts\windows\install.bat
   ```

2. **Run project locally**:
   ```cmd
   .\scripts\windows\dev.bat
   ```

3. **Pull code pi GitHub**:
   ```cmd
   .\scripts\windows\pull.bat
   ```

4. **Push code tv GitHub**:
   ```cmd
   .\scripts\windows\git-push.bat "sraser bnyol pi code del tver ti nis"
   ```

5. **Sync Code (Pull + Push)**:
   ```cmd
   .\scripts\windows\git-sync.bat "sraser bnyol pi code del tver ti nis"
   ```

---
💡 **cham (Note smrab Error)**: 
ber pel tver `git-sync` or `git-push` hz lout error **"Conflict detected"**, mean ney tha mean ke edit code ler file knea jmuoy ey del yeng kpong tver. Script neng chhob phleamๆ! kngar del trov tver bntor kyy dorh-sray conflict nv knong VSCode/IDE sin, rouch cham type `git rebase --continue` hz push kloun eng.
