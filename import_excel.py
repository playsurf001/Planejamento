#!/usr/bin/env python3
"""
Script de Importação de Excel para Cloudflare D1
Importa dados de planilha Excel para o banco de dados D1
"""

import pandas as pd
import json
import sys
import subprocess
from datetime import datetime
from pathlib import Path

def limpar_valor(val):
    """Remove NaN e valores vazios"""
    if pd.isna(val) or val == '' or val == 'nan':
        return None
    return val

def processar_produtos(excel_file):
    """Extrai produtos da aba 'Listas - Produtos'"""
    print("📦 Processando produtos...")
    
    df = pd.read_excel(excel_file, sheet_name='Listas - Produtos')
    produtos = []
    
    for idx, row in df.iterrows():
        produto = limpar_valor(row.get('Produtos'))
        if produto and produto != 'Produtos':  # Ignorar header
            produtos.append({
                'nome': str(produto).strip(),
                'ativo': 1
            })
    
    print(f"   ✓ {len(produtos)} produtos encontrados")
    return produtos

def processar_designers(excel_file):
    """Extrai designers da aba 'Listas - Pessoas'"""
    print("👤 Processando designers...")
    
    df = pd.read_excel(excel_file, sheet_name='Listas -  Pessoas')
    designers = []
    
    for idx, row in df.iterrows():
        designer = limpar_valor(row.get('DESIGNER'))
        if designer and designer != 'DESIGNER':  # Ignorar header
            designers.append({
                'nome': str(designer).strip(),
                'ativo': 1
            })
    
    print(f"   ✓ {len(designers)} designers encontrados")
    return designers

def processar_lancamentos(excel_file):
    """Extrai lançamentos da aba 'Lançamentos'"""
    print("📊 Processando lançamentos...")
    
    df = pd.read_excel(excel_file, sheet_name='Lançamentos')
    lancamentos = []
    
    # A planilha tem múltiplas colunas ID Lançamento, Semana, Data, etc
    # Vamos processar cada grupo de colunas
    grupos = []
    for col in df.columns:
        if 'ID Lançamento' in str(col) and 'Unnamed' not in str(col):
            base = col.replace('ID Lançamento', '').strip()
            if base == '':
                suffix = ''
            else:
                suffix = base
            grupos.append(suffix)
    
    for suffix in grupos:
        id_col = f'ID Lançamento{suffix}'
        semana_col = f'Semana{suffix}'
        data_col = f'Data{suffix}'
        designer_col = f'Designer{suffix}'
        produto_col = f'Produto{suffix}'
        criada_col = f'Quant Criada{suffix}'
        aprovada_col = f'Quant Aprovada{suffix}'
        
        for idx, row in df.iterrows():
            id_lanc = limpar_valor(row.get(id_col))
            semana = limpar_valor(row.get(semana_col))
            data = limpar_valor(row.get(data_col))
            designer = limpar_valor(row.get(designer_col))
            produto = limpar_valor(row.get(produto_col))
            criada = limpar_valor(row.get(criada_col))
            aprovada = limpar_valor(row.get(aprovada_col))
            
            # Apenas registros com dados válidos
            if id_lanc and semana and designer and produto:
                # Converter data
                if pd.isna(data):
                    data_str = datetime.now().strftime('%Y-%m-%d')
                elif isinstance(data, datetime):
                    data_str = data.strftime('%Y-%m-%d')
                else:
                    try:
                        data_str = pd.to_datetime(data).strftime('%Y-%m-%d')
                    except:
                        data_str = datetime.now().strftime('%Y-%m-%d')
                
                lancamentos.append({
                    'semana': int(semana),
                    'data': data_str,
                    'designer': str(designer).strip(),
                    'produto': str(produto).strip(),
                    'quantidade_criada': int(criada) if criada and not pd.isna(criada) else 0,
                    'quantidade_aprovada': int(aprovada) if aprovada and not pd.isna(aprovada) else 0,
                    'criado_check': 1 if criada and not pd.isna(criada) and int(criada) > 0 else 0,
                    'aprovado_ok': 1 if aprovada and not pd.isna(aprovada) and int(aprovada) > 0 else 0,
                    'status': 'completo' if (criada and aprovada) else 'pendente'
                })
    
    print(f"   ✓ {len(lancamentos)} lançamentos encontrados")
    return lancamentos

def gerar_sql(produtos, designers, lancamentos):
    """Gera arquivo SQL com os dados"""
    print("\n📝 Gerando SQL...")
    
    sql = """-- Importação automática de Excel
-- Gerado em: {}

-- Limpar dados existentes
DELETE FROM lancamentos;
DELETE FROM produtos;
DELETE FROM designers;

-- Inserir Designers
""".format(datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
    
    for designer in designers:
        sql += f"INSERT INTO designers (nome, ativo) VALUES ('{designer['nome']}', 1);\n"
    
    sql += "\n-- Inserir Produtos\n"
    for produto in produtos:
        sql += f"INSERT INTO produtos (nome, ativo) VALUES ('{produto['nome']}', 1);\n"
    
    sql += "\n-- Inserir Lançamentos\n"
    for lanc in lancamentos:
        sql += f"""INSERT INTO lancamentos (designer_id, produto_id, semana, data, quantidade_criada, quantidade_aprovada, criado_check, aprovado_ok, status) 
SELECT d.id, p.id, {lanc['semana']}, '{lanc['data']}', {lanc['quantidade_criada']}, {lanc['quantidade_aprovada']}, {lanc['criado_check']}, {lanc['aprovado_ok']}, '{lanc['status']}'
FROM designers d, produtos p
WHERE d.nome = '{lanc['designer']}' AND p.nome = '{lanc['produto']}';
"""
    
    return sql

def main():
    if len(sys.argv) < 2:
        print("Uso: python3 import_excel.py <arquivo.xlsx>")
        sys.exit(1)
    
    excel_file = sys.argv[1]
    
    if not Path(excel_file).exists():
        print(f"❌ Arquivo não encontrado: {excel_file}")
        sys.exit(1)
    
    print(f"\n🚀 Importando dados de: {excel_file}\n")
    
    try:
        # Processar dados
        produtos = processar_produtos(excel_file)
        designers = processar_designers(excel_file)
        lancamentos = processar_lancamentos(excel_file)
        
        # Gerar SQL
        sql = gerar_sql(produtos, designers, lancamentos)
        
        # Salvar arquivo SQL
        output_file = 'import_from_excel.sql'
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(sql)
        
        print(f"\n✅ Arquivo SQL gerado: {output_file}")
        print(f"\n📊 Resumo:")
        print(f"   • Designers: {len(designers)}")
        print(f"   • Produtos: {len(produtos)}")
        print(f"   • Lançamentos: {len(lancamentos)}")
        
        print(f"\n🔧 Para importar no D1, execute:")
        print(f"   npx wrangler d1 execute webapp-production --remote --file={output_file}")
        
    except Exception as e:
        print(f"\n❌ Erro: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == '__main__':
    main()
