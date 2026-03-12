#!/usr/bin/env python3
"""
Script para importar dados da planilha Excel para D1 Database (local)
com suporte a checklist e status dos designers
"""

import pandas as pd
import sqlite3
from datetime import datetime
import os
import warnings
warnings.filterwarnings('ignore')

# Caminho do banco D1 local
DB_PATH = '/home/user/webapp/.wrangler/state/v3/d1/miniflare-D1DatabaseObject/5df751ddbe6ab451018acf12566757569bb135c225b87a93174edf82e3b19fa3.sqlite'
EXCEL_FILE = '/home/user/uploaded_files/controle_producao1.xlsx'

def connect_db():
    """Conecta ao banco SQLite local do D1"""
    return sqlite3.connect(DB_PATH)

def import_designers_and_products(conn):
    """Importa designers e produtos das listas"""
    cursor = conn.cursor()
    
    # Ler listas (note o espaço duplo em 'Listas -  Pessoas')
    df_pessoas = pd.read_excel(EXCEL_FILE, sheet_name='Listas -  Pessoas')
    df_produtos = pd.read_excel(EXCEL_FILE, sheet_name='Listas - Produtos')
    
    # Importar designers
    designers = df_pessoas['DESIGNER'].dropna().unique()
    print(f"Designers encontrados: {list(designers)}")
    
    for designer in designers:
        cursor.execute('''
            INSERT OR IGNORE INTO designers (nome) 
            VALUES (?)
        ''', (designer,))
    
    # Importar produtos  
    produtos = df_produtos['Produtos'].dropna().unique()
    print(f"Produtos encontrados: {list(produtos)}")
    
    for produto in produtos:
        cursor.execute('''
            INSERT OR IGNORE INTO produtos (nome) 
            VALUES (?)
        ''', (produto,))
    
    conn.commit()
    
    # Retornar mapeamentos
    cursor.execute('SELECT id, nome FROM designers')
    designers_map = {row[1]: row[0] for row in cursor.fetchall()}
    
    cursor.execute('SELECT id, nome FROM produtos')
    produtos_map = {row[1]: row[0] for row in cursor.fetchall()}
    
    return designers_map, produtos_map

def import_lancamentos(conn, designers_map, produtos_map):
    """Importa lançamentos da aba Lançamentos"""
    cursor = conn.cursor()
    
    # Ler aba de lançamentos
    df = pd.read_excel(EXCEL_FILE, sheet_name='Lançamentos')
    
    # Limpar dados
    df = df.dropna(subset=['Designer', 'Produto'])
    
    imported = 0
    for _, row in df.iterrows():
        designer_id = designers_map.get(row['Designer'])
        produto_id = produtos_map.get(row['Produto'])
        
        if not designer_id or not produto_id:
            continue
        
        semana = str(row.get('Semana', '')).strip() if pd.notna(row.get('Semana')) else None
        
        # Processar data
        data_val = row.get('Data')
        if pd.isna(data_val):
            data = None
        elif isinstance(data_val, pd.Timestamp):
            data = data_val.strftime('%Y-%m-%d')
        else:
            data = None
        
        # Quantidades
        qtd_criada = int(row.get('Quant Criada', 0)) if pd.notna(row.get('Quant Criada')) else 0
        qtd_aprovada = int(row.get('Quant Aprovada', 0)) if pd.notna(row.get('Quant Aprovada')) else 0
        
        # Status automático baseado nas quantidades
        criado_check = 1 if qtd_criada > 0 else 0
        aprovado_ok = 1 if qtd_aprovada > 0 else 0
        
        if criado_check and aprovado_ok:
            status = 'completo'
        elif criado_check:
            status = 'em_aprovacao'
        else:
            status = 'pendente'
        
        try:
            cursor.execute('''
                INSERT INTO lancamentos 
                (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, 
                 criado_check, aprovado_ok, status, posicao)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (designer_id, produto_id, semana, data, qtd_criada, qtd_aprovada, 
                  criado_check, aprovado_ok, status, None))
            imported += 1
        except Exception as e:
            print(f"Erro ao importar linha: {e}")
    
    conn.commit()
    return imported

def import_metas(conn, produtos_map):
    """Importa metas da aba Metas"""
    cursor = conn.cursor()
    
    df = pd.read_excel(EXCEL_FILE, sheet_name='Metas')
    df = df.dropna(subset=['Produto'])
    
    imported = 0
    for _, row in df.iterrows():
        produto_id = produtos_map.get(row['Produto'])
        if not produto_id:
            continue
        
        meta_aprovacao = int(row.get('Meta de Aprovação (18 Semanas)', 0)) if pd.notna(row.get('Meta de Aprovação (18 Semanas)')) else 0
        
        if meta_aprovacao > 0:
            try:
                cursor.execute('''
                    INSERT OR REPLACE INTO metas (produto_id, meta_aprovacao, periodo_semanas)
                    VALUES (?, ?, ?)
                ''', (produto_id, meta_aprovacao, 18))
                imported += 1
            except Exception as e:
                print(f"Erro ao importar meta: {e}")
    
    conn.commit()
    return imported

def main():
    print("=== Importação de Dados do Excel para D1 (com Checklist) ===\n")
    
    if not os.path.exists(DB_PATH):
        print(f"❌ Banco de dados não encontrado em: {DB_PATH}")
        print("Execute: npm run db:migrate:local")
        return
    
    if not os.path.exists(EXCEL_FILE):
        print(f"❌ Arquivo Excel não encontrado: {EXCEL_FILE}")
        return
    
    conn = connect_db()
    
    try:
        # Importar designers e produtos
        print("📥 Importando designers e produtos...")
        designers_map, produtos_map = import_designers_and_products(conn)
        print(f"✅ {len(designers_map)} designers, {len(produtos_map)} produtos\n")
        
        # Importar lançamentos
        print("📥 Importando lançamentos...")
        lancamentos_imported = import_lancamentos(conn, designers_map, produtos_map)
        print(f"✅ {lancamentos_imported} lançamentos importados\n")
        
        # Importar metas
        print("📥 Importando metas...")
        metas_imported = import_metas(conn, produtos_map)
        print(f"✅ {metas_imported} metas importadas\n")
        
        print("=" * 60)
        print("✅ Importação concluída com sucesso!")
        print("=" * 60)
        
    except Exception as e:
        print(f"❌ Erro durante importação: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == '__main__':
    main()
