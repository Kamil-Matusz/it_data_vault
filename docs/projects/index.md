---
hide:
  - toc
---

# Projects

Public repositories with a short description and categories. Use the chips to filter, or search by name.

<!--
Add a repo by copying a table row.
data-categories: space-separated slugs (dotnet java web mobile docs data learning)
data-search: extra words used by the search box
-->

<div class="repo-catalog" data-repo-catalog markdown="1">

<div class="repo-toolbar">
  <label class="repo-search-label">
    <span class="visually-hidden">Search repositories</span>
    <input class="repo-search" type="search" placeholder="Search repositories" data-repo-search autocomplete="off">
  </label>
  <div class="repo-filters" data-repo-filters role="group" aria-label="Filter by category">
    <button type="button" class="repo-chip is-active" data-filter="all">All</button>
    <button type="button" class="repo-chip" data-filter="dotnet">.NET</button>
    <button type="button" class="repo-chip" data-filter="java">Java</button>
    <button type="button" class="repo-chip" data-filter="web">Web</button>
    <button type="button" class="repo-chip" data-filter="mobile">Mobile</button>
    <button type="button" class="repo-chip" data-filter="docs">Docs</button>
    <button type="button" class="repo-chip" data-filter="data">Data</button>
    <button type="button" class="repo-chip" data-filter="learning">Learning</button>
  </div>
</div>

<div class="repo-table-wrap">
<table>
  <thead>
    <tr>
      <th>Repository</th>
      <th>Description</th>
      <th>Categories</th>
    </tr>
  </thead>
  <tbody>
    <!--
    <tr class="repo-row" data-categories="dotnet" data-search="example">
      <td><a href="https://github.com/org/repo">repo</a></td>
      <td>Short description.</td>
      <td><button type="button" class="repo-tag" data-filter="dotnet">.NET</button></td>
    </tr>
    -->
    <tr class="repo-row" data-categories="dotnet web" data-search="blockchain ethereum polygon certificates solidity research">
      <td><a href="https://github.com/Kamil-Matusz/CertiBlock">CertiBlock</a></td>
      <td>Research system for evaluating the efficiency of blockchain technologies (Ethereum &amp; Polygon) in the registration and verification of digital certificates.</td>
      <td><button type="button" class="repo-tag" data-filter="dotnet">.NET</button> <button type="button" class="repo-tag" data-filter="web">Web</button></td>
    </tr>
  </tbody>
</table>
</div>

<p class="repo-empty" data-repo-empty hidden>No repositories to show.</p>

</div>
