import json, sys
import networkx as nx
from networkx.readwrite import json_graph
from pathlib import Path

if __name__ == "__main__":
    data = json.loads(Path("graphify-out/graph.json").read_text(encoding="utf-8"))
    G = json_graph.node_link_graph(data, edges="links")

    question = "_calcola_residuo duplicated three modules"
    terms = ["calcola", "residuo"]

    scored = []
    for nid, ndata in G.nodes(data=True):
        label = ndata.get("label", "").lower()
        score = sum(1 for t in terms if t in label)
        if score > 0:
            scored.append((score, nid))
    scored.sort(reverse=True)
    start_nodes = [nid for _, nid in scored[:6]]

    print(f"Start nodes ({len(start_nodes)}):")
    for n in start_nodes:
        print(f"  {G.nodes[n].get('label', n)} [{G.nodes[n].get('source_file', '')}]")

    subgraph_nodes = set(start_nodes)
    frontier = set(start_nodes)
    subgraph_edges = []
    for _ in range(3):
        next_frontier = set()
        for n in frontier:
            for neighbor in G.neighbors(n):
                if neighbor not in subgraph_nodes:
                    next_frontier.add(neighbor)
                    subgraph_edges.append((n, neighbor))
        subgraph_nodes.update(next_frontier)
        frontier = next_frontier

    print(f"\nSubgraph: {len(subgraph_nodes)} nodes, {len(subgraph_edges)} edges\n")
    print("EDGES:")
    for u, v in subgraph_edges[:80]:
        if u in subgraph_nodes and v in subgraph_nodes:
            d = G.edges[u, v]
            ul = G.nodes[u].get("label", u)[:40]
            vl = G.nodes[v].get("label", v)[:40]
            rel = d.get("relation", "")
            conf = d.get("confidence", "")
            cs = d.get("confidence_score", "")
            sf = d.get("source_file", "")
            loc = d.get("source_location", "")
            print(f"  {ul} --{rel} [{conf} {cs}]--> {vl}  ({sf} {loc})")
