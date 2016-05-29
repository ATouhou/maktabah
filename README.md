# maktabah

Maktabah shamela utility

# usage

```
  Usage: maktabah [options] [command]


  Commands:

    dump <book>   dump maktabah bookfile to json
    schema        install or uninstall maktabah schema
    kitab <book>  install or uninstall maktabah kitab
    help [cmd]    display help for [cmd]

  Maktabah shamela utility

  Options:

    -h, --help     output usage information
    -V, --version  output the version number
```

```
  Usage: maktabah-dump [options]

  dump maktabah bookfile to json

  Options:

    -h, --help            output usage information
    -s, --spaces <count>  JSON space count
```

```
  Usage: maktabah-schema [options]

  install or uninstall maktabah schema

  Options:

    -h, --help                  output usage information
    -u, --uninstall             uninstall schema instead of install
    -c, --config <config-file>  path to knex configurations file
    -d, --dump                  dump query instead of excuting directly
```

```
  Usage: maktabah-kitab [options]

  install or uninstall maktabah kitab

  Options:

    -h, --help                  output usage information
    -u, --uninstall             uninstall kitab instead of install
    -c, --config <config-file>  path to knex configurations file
    -d, --dump                  dump query instead of excuting directly
```

# requirements

[mdb-tools](https://github.com/brianb/mdbtools) must be installed.
