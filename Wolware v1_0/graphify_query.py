import sys, json
from networkx.readwrite import json_graph
import networkx as nx
from pathlib import Path

data = json.loads(Path('graphify-out/graph.json').read_text())
G = json_graph.node_link_graph(data, edges='links')

question = 'tempo determinato scadenza data_fine causale campo form mostra'
terms = [t.lower() for t in question.split() if len(t) > 3]

scored = []
for nid, ndata in G.nodes(data=True):
    label = ndata.get('label', '').lower()
    score = sum(1 for t in terms if t in label)
    if score > 0:
        scored.append((score, nid))
scored.sort(reverse=True)

print('Top matching nodes:')
for sc, nid in scored[:15]:
    d = G.nodes[nid]
    print(f"  [{sc}] {d.get('label', nid)} | file={d.get('source_file', '')} | loc={d.get('source_location', '')}")

start_nodes = [nid for _, nid in scored[:5]]
subgraph_nodes = set(start_nodes)
frontier = set(start_nodes)
for _ in range(3):
    next_frontier = set()
    for n in frontier:
        for neighbor in G.neighbors(n):
            if neighbor not in subgraph_nodes:
                next_frontier.add(neighbor)
    subgraph_nodes.update(next_frontier)
    frontier = next_frontier

print(f'\nSubgraph: {len(subgraph_nodes)} nodes')
for nid in subgraph_nodes:
    d = G.nodes[nid]
    print(f"  NODE {d.get('label', nid)} [src={d.get('source_file', '')} loc={d.get('source_location', '')}]")
for u, v in G.edges():
    if u in subgraph_nodes and v in subgraph_nodes:
        d = G.edges[u, v]
        print(f"  EDGE {G.nodes[u].get('label', u)} --{d.get('relation', '')} [{d.get('confidence', '')}]--> {G.nodes[v].get('label', v)}")
