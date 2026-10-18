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
    <tr class="repo-row" data-categories="dotnet" data-search="medical healthcare clinic hospital engineering thesis">
      <td><a href="https://github.com/Kamil-Matusz/Asklepios">Asklepios</a></td>
      <td>A system supporting and offering support for medical facilities. Technical part of the engineering thesis.</td>
      <td><button type="button" class="repo-tag" data-filter="dotnet">.NET</button></td>
    </tr>
    <tr class="repo-row" data-categories="dotnet web" data-search="template dotnet new aspnet core web api clean onion architecture">
      <td><a href="https://github.com/Kamil-Matusz/CleanArchitecture">CleanArchitecture</a></td>
      <td>A lightweight, opinionated <code>dotnet new</code> project template for ASP.NET Core Web API applications following the principles of Clean Architecture (Onion Architecture).</td>
      <td><button type="button" class="repo-tag" data-filter="dotnet">.NET</button> <button type="button" class="repo-tag" data-filter="web">Web</button></td>
    </tr>
    <tr class="repo-row" data-categories="dotnet web" data-search="blacklist poker playing cards deck suits violations points standings aspnet core cosmos db react spa jwt polish azure devops">
      <td><a href="https://dev.azure.com/Awahir/BlacklistPoker">BlacklistPoker</a></td>
      <td>A private record book of people who wronged you, drawn as a deck of playing cards. Each entry collects violations worth 1-100 points; the total drives the card's suit (♣ → ♦ → ♥ → ♠) and its place in your standings. ASP.NET Core 10 + Cosmos DB, React 19 SPA, JWT auth, Polish UI.</td>
      <td><button type="button" class="repo-tag" data-filter="dotnet">.NET</button> <button type="button" class="repo-tag" data-filter="web">Web</button></td>
    </tr>
    <tr class="repo-row" data-categories="java web" data-search="fuel price tracking on pb95 pb98 lpg diesel petrol gas station spring boot rest api mongodb react typescript">
      <td><a href="https://github.com/Kamil-Matusz/PetroTrend">PetroTrend</a></td>
      <td>A fuel price tracking application (ON, PB95, PB98, LPG). The backend is a Spring Boot REST API backed by MongoDB; the frontend is a React + TypeScript UI styled after a roadside station price pylon.</td>
      <td><button type="button" class="repo-tag" data-filter="java">Java</button> <button type="button" class="repo-tag" data-filter="web">Web</button></td>
    </tr>
    <tr class="repo-row" data-categories="java learning" data-search="design patterns gof creational structural behavioral oop examples">
      <td><a href="https://github.com/Kamil-Matusz/Design-Patterns">Design-Patterns</a></td>
      <td>This repository contains practical examples of commonly used design patterns implemented in Java. Each pattern is presented in a simple and clear way to help understand its structure, purpose, and use case.</td>
      <td><button type="button" class="repo-tag" data-filter="java">Java</button> <button type="button" class="repo-tag" data-filter="learning">Learning</button></td>
    </tr>
  </tbody>
</table>
</div>

<p class="repo-empty" data-repo-empty hidden>No repositories to show.</p>

</div>
