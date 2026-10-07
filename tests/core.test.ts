import { describe, it, expect } from 'vitest';
import { emptyData, previousMonth, change, rupiah, validDate, summarize, putTransaction, removeTransaction, removeCategory, validateData, exportCsv } from '../src/core/ledger';
import { seal, unseal, createAccount, unlockAccount, unlockPin } from '../src/core/vault';
const tx = (overrides = {}) => ({ id:'t',type:'income' as const,date:'2026-10-07',title:'Gaji',categoryId:'in-0',amount:10000000,note:'',createdAt:'now',updatedAt:'now',allocation:'regular' as const,...overrides });
describe('ledger', () => {
 it('menghitung saldo, alokasi dan filter bulan dari ledger tepat sekali',()=>{let d=emptyData();d=putTransaction(d,tx());d=putTransaction(d,tx({id:'e',type:'expense',categoryId:'out-0',amount:350000}));d=putTransaction(d,tx({id:'s',type:'expense',categoryId:'out-0',amount:100000,allocation:'savings',targetId:'g'}),false);d=putTransaction(d,tx({id:'old',date:'2026-09-01',amount:9000000}));expect(summarize(d,'2026-10')).toMatchObject({income:10000000,expense:450000,balance:9550000,savings:100000});expect(summarize(d,'2026-09').income).toBe(9000000);});
 it('edit/hapus memperbarui hasil',()=>{let d=putTransaction(emptyData(),tx());d=putTransaction(d,tx({amount:20}));expect(d.transactions).toHaveLength(1);expect(summarize(d,'2026-10').income).toBe(20);expect(removeTransaction(d,'t').transactions).toHaveLength(0);});
 it('kategori terpakai dilindungi, kategori berbeda jenis ditolak',()=>{const d=putTransaction(emptyData(),tx());expect(()=>removeCategory(d,'in-0')).toThrow();expect(()=>putTransaction(d,tx({categoryId:'out-0'}))).toThrow();});
 it('nominal invalid ditolak',()=>{for(const amount of [0,-1,1.2,NaN,Number.MAX_SAFE_INTEGER+1])expect(()=>putTransaction(emptyData(),tx({amount}))).toThrow();});
 it('bulan sebelumnya lintas tahun',()=>{expect(previousMonth('2026-01')).toBe('2025-12');expect(previousMonth('2026-10')).toBe('2026-09');});
 it('persentase nol dan kenaikan',()=>{expect(change(100,0)).toBeNull();expect(change(0,0)).toBe(0);expect(change(10000000,9000000)).toBeCloseTo(11.111);expect(change(0,100)).toBe(-100);});
 it('tanggal lokal dan kabisat',()=>{expect(validDate('2024-02-29')).toBe(true);expect(validDate('2026-02-29')).toBe(false);expect(validDate('2026-13-01')).toBe(false);expect(validDate('2026-12-31')).toBe(true);});
 it('Rupiah locale Indonesia',()=>expect(rupiah(10000000).replace(/\s/g,' ')).toBe('Rp 10.000.000'));
 it('backup schema menolak rusak, duplikat dan relasi yatim',()=>{expect(validateData(emptyData()).version).toBe(1);expect(()=>validateData({version:8})).toThrow();const d=putTransaction(emptyData(),tx());expect(()=>validateData({...d,transactions:[tx(),tx()]})).toThrow();expect(()=>validateData({...d,categories:[]})).toThrow();});
 it('CSV aman dari formula injection dan mengutip koma',()=>{const d=putTransaction(emptyData(),tx({title:'=SUM(1,2)'}));expect(exportCsv(d)).toContain("'=SUM(1,2)");});
});
describe('vault',()=>{
 it('AES backup roundtrip, password salah dan tamper ditolak',async()=>{const d=emptyData();const e=await seal(d,'Password-ku-2026');expect(JSON.stringify(e)).not.toContain('categories');expect(await unseal(e,'Password-ku-2026')).toEqual(d);await expect(unseal(e,'wrong')).rejects.toThrow();await expect(unseal({...e,cipher:'broken'},'Password-ku-2026')).rejects.toThrow();});
 it('akun dan PIN tidak menyimpan plaintext dan membuka kunci yang sama',async()=>{const a=await createAccount('fahmi','Password-ku-2026','123456');expect(JSON.stringify(a.record)).not.toContain('Password-ku-2026');expect(JSON.stringify(a.record)).not.toContain('123456');expect(await unlockAccount(a.record,'Password-ku-2026')).toEqual(a.key);expect(await unlockPin(a.record,'123456')).toEqual(a.key);await expect(unlockPin(a.record,'654321')).rejects.toThrow();});
});
