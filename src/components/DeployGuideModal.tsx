import React, { useState } from 'react';
import { X, Gitlab, Github, Copy, Check, Terminal, ShieldCheck, Globe } from 'lucide-react';

interface DeployGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GITHUB_ACTIONS_CONTENT = `name: Deploy TripSplit to GitHub Pages

on:
  push:
    branches:
      - main
      - master
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: 'pages'
  cancel-in-progress: false

jobs:
  build-and-deploy:
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js 22
        uses: actions/setup-node@v4
        with:
          node-version: 22

      - name: Install dependencies
        run: npm install --legacy-peer-deps

      - name: Build static site with Vite
        run: npm run build

      - name: Setup GitHub Pages
        uses: actions/configure-pages@v5
        with:
          enablement: true

      - name: Upload static artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
`;

const GITLAB_CI_CONTENT = `image: node:20

pages:
  stage: deploy
  script:
    - npm install --legacy-peer-deps
    - npm run build
    - rm -rf public
    - mv dist public
  artifacts:
    paths:
      - public
  rules:
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH
`;

export const DeployGuideModal: React.FC<DeployGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activePlatform, setActivePlatform] = useState<'github' | 'gitlab'>('github');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedCommands, setCopiedCommands] = useState(false);

  if (!isOpen) return null;

  const githubCommands = `git remote add origin https://github.com/<YOUR-USERNAME>/tripsplit.git
git branch -M main
git push -u origin main`;

  const gitlabCommands = `git remote add origin https://gitlab.com/<YOUR-USERNAME>/tripsplit.git
git branch -M main
git push -u origin main`;

  const handleCopyCode = () => {
    const text = activePlatform === 'github' ? GITHUB_ACTIONS_CONTENT : GITLAB_CI_CONTENT;
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyCommands = () => {
    const text = activePlatform === 'github' ? githubCommands : gitlabCommands;
    navigator.clipboard.writeText(text);
    setCopiedCommands(true);
    setTimeout(() => setCopiedCommands(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-2xl my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shadow-xs">
              {activePlatform === 'github' ? (
                <Github className="w-6 h-6 text-white" />
              ) : (
                <Gitlab className="w-6 h-6 text-amber-500" />
              )}
            </div>
            <div>
              <h3 className="text-base font-bold">
                วิธีรันและ Deploy บน {activePlatform === 'github' ? 'GitHub Pages' : 'GitLab Pages'}
              </h3>
              <p className="text-xs text-slate-400">
                พร้อมไฟล์ CI/CD สำเร็จรูป รันฟรี 100% ไม่ต้องตั้งค่า Server
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Platform Selector Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-2">
          <button
            onClick={() => setActivePlatform('github')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-t-xl transition-all cursor-pointer ${
              activePlatform === 'github'
                ? 'bg-white text-slate-900 border-t border-x border-slate-200 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Github className="w-4 h-4" />
            <span>GitHub Pages (แนะนำ)</span>
          </button>
          <button
            onClick={() => setActivePlatform('gitlab')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-t-xl transition-all cursor-pointer ${
              activePlatform === 'gitlab'
                ? 'bg-white text-slate-900 border-t border-x border-slate-200 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Gitlab className="w-4 h-4 text-amber-600" />
            <span>GitLab Pages</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto text-xs text-slate-700">
          
          {/* Download Project ZIP Banner */}
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="font-bold text-emerald-900 text-sm flex items-center gap-1.5">
                <span>📦 โค้ดทั้งหมดพร้อมแล้ว ดาวน์โหลดไปใช้ได้ทันที</span>
              </div>
              <p className="text-xs text-emerald-700 mt-0.5">
                ดาวน์โหลดไฟล์ .zip ที่มีครบทั้งโค้ดเว็บ, .github/workflows และ .gitlab-ci.yml
              </p>
            </div>
            <a
              href="./tripsplit-project.zip"
              download="tripsplit-project.zip"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
            >
              <span>ดาวน์โหลดโค้ด (.zip)</span>
            </a>
          </div>

          {/* Key Advantages */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Git พร้อมใช้งานแล้ว</span>
              </div>
              <p className="text-[11px] text-slate-500">
                เราได้ทำ Initial Commit ไว้ในโปรเจกต์นี้ให้เรียบร้อยแล้ว
              </p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-blue-600" />
                <span>Base Path สัมพัทธ์</span>
              </div>
              <p className="text-[11px] text-slate-500">
                ตั้งค่า <code className="text-slate-700 font-mono">base: './'</code> ใน Vite แล้ว เข้าผ่าน subpath ได้ไร้รอยต่อ
              </p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-purple-600" />
                <span>CI/CD อัตโนมัติ</span>
              </div>
              <p className="text-[11px] text-slate-500">
                มีไฟล์ Workflow สำหรับ Build และ Deploy ขึ้น Pages ทันทีที่ Push
              </p>
            </div>
          </div>

          {/* GitHub Specific Instructions */}
          {activePlatform === 'github' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-2">
                  ขั้นตอนการ Push ขึ้น GitHub (3 ขั้นตอน):
                </h4>
                <ol className="space-y-3 list-decimal list-inside pl-1 text-slate-600">
                  <li className="pl-1">
                    <strong className="text-slate-900">สร้าง New Repository บน GitHub:</strong> ไปที่ <a href="https://github.com/new" target="_blank" rel="noreferrer" className="text-blue-600 underline font-medium">github.com/new</a> แล้วตั้งชื่อ Repo เช่น <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-800">tripsplit</code> (เลือกเป็น Public)
                  </li>
                  <li className="pl-1">
                    <strong className="text-slate-900">เชื่อมต่อ Remote และ Push:</strong>
                    <div className="mt-1.5 relative">
                      <pre className="p-3 bg-slate-900 text-slate-100 rounded-xl font-mono text-[11px] overflow-x-auto">
                        {githubCommands}
                      </pre>
                      <button
                        onClick={handleCopyCommands}
                        className="absolute right-2 top-2 p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors flex items-center gap-1 text-[10px]"
                      >
                        {copiedCommands ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedCommands ? 'คัดลอกแล้ว' : 'คัดลอกคำสั่ง'}</span>
                      </button>
                    </div>
                  </li>
                  <li className="pl-1">
                    <strong className="text-slate-900">เปิดใช้งาน GitHub Pages:</strong>
                    <p className="mt-1">
                      ใน GitHub ไปที่แท็บ <strong>Settings</strong> &gt; <strong>Pages</strong> ด้านซ้าย ใต้หัวข้อ <em>Build and deployment / Source</em> ให้เลือกเป็น <strong className="text-slate-900">GitHub Actions</strong> แล้วระบบจะรันไฟล์ workflow อัตโนมัติ!
                    </p>
                  </li>
                </ol>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-slate-900">
                    ไฟล์ <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono">.github/workflows/deploy.yml</code> ที่เตรียมไว้:
                  </span>
                  <button
                    onClick={handleCopyCode}
                    className="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 transition-colors"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode ? 'คัดลอกแล้ว!' : 'คัดลอก YAML'}</span>
                  </button>
                </div>
                <pre className="p-3.5 bg-slate-950 text-emerald-400 font-mono text-[11px] rounded-xl overflow-x-auto max-h-40 border border-slate-800">
                  {GITHUB_ACTIONS_CONTENT}
                </pre>
              </div>
            </div>
          )}

          {/* GitLab Specific Instructions */}
          {activePlatform === 'gitlab' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-2">
                  ขั้นตอนการ Push ขึ้น GitLab (3 ขั้นตอน):
                </h4>
                <ol className="space-y-3 list-decimal list-inside pl-1 text-slate-600">
                  <li className="pl-1">
                    <strong className="text-slate-900">สร้าง Blank Project บน GitLab:</strong> เข้า <a href="https://gitlab.com/projects/new" target="_blank" rel="noreferrer" className="text-blue-600 underline font-medium">gitlab.com</a> แล้วตั้งชื่อ Repo
                  </li>
                  <li className="pl-1">
                    <strong className="text-slate-900">เชื่อมต่อ Remote และ Push:</strong>
                    <div className="mt-1.5 relative">
                      <pre className="p-3 bg-slate-900 text-slate-100 rounded-xl font-mono text-[11px] overflow-x-auto">
                        {gitlabCommands}
                      </pre>
                      <button
                        onClick={handleCopyCommands}
                        className="absolute right-2 top-2 p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors flex items-center gap-1 text-[10px]"
                      >
                        {copiedCommands ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedCommands ? 'คัดลอกแล้ว' : 'คัดลอกคำสั่ง'}</span>
                      </button>
                    </div>
                  </li>
                  <li className="pl-1">
                    <strong className="text-slate-900">GitLab CI/CD จะทำงานอัตโนมัติ:</strong>
                    <p className="mt-1">
                      GitLab จะรัน job <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">pages</code> ตามที่ระบุในไฟล์ <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">.gitlab-ci.yml</code> และแสดงลิงก์ที่เมนู <strong>Deploy &gt; Pages</strong>
                    </p>
                  </li>
                </ol>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-slate-900">
                    ไฟล์ <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono">.gitlab-ci.yml</code> ที่เตรียมไว้:
                  </span>
                  <button
                    onClick={handleCopyCode}
                    className="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 transition-colors"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode ? 'คัดลอกแล้ว!' : 'คัดลอก YAML'}</span>
                  </button>
                </div>
                <pre className="p-3.5 bg-slate-950 text-emerald-400 font-mono text-[11px] rounded-xl overflow-x-auto max-h-40 border border-slate-800">
                  {GITLAB_CI_CONTENT}
                </pre>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            เข้าใจแล้ว
          </button>
        </div>

      </div>
    </div>
  );
};
