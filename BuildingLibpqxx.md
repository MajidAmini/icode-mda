# Introduction #
If you are using Visual Studio 2010 Service Pack 1, you can download a pre-compiled libpqxx from here:

http://code.google.com/p/icode-mda/downloads/detail?name=libpqxx.zip

Otherwise, you'll need to continue reading. The instructions below are for Windows 7, using Microsoft Visual Studio 2010.

libpqxx is the official C++ client API for  PostgreSQL, the enterprise-strength open-source relational database. (If "PostgreSQL" is too verbose, call it by its shorter name, postgres).

If you are writing software in C++ that needs to access databases managed by postgres—on just about any platform—then libpqxx is the library you use. It is the standard C++ language binding for the postgres RDBMS.

The source code for libpqxx is available under the BSD license, so you're free to download it, pass it on to others, change it, sell it, include it in your own code, and share your changes with anyone you choose. No charge, no catch. In most cases you'll want a pre-built package provided by a package maintainer for your platform, and distributed through your normal package management infrastructure.

http://pqxx.org/development/libpqxx/

# Pre-Build #
You will need to download the libpqxx source code:

http://pqxx.org/development/libpqxx/wiki/DownloadPage

This page will refer to version 4.0

To build libpqxx, you will also need the libpq library and header files. There are a number of ways to do this, I will assume that you have gotten them by installing a PostgreSQL database on your machine.

http://www.postgresql.org/download/

http://www.enterprisedb.com/products-services-training/pgdownload#windows

If you choose to install a 32-bit database, you will only be able to build the 32-bit libpqxx (similarly for 64-bit)

The build process is very similar with only a few different changes between the 32/64 machines.

# 32-bit and 64-bit #
In the libpqxx source code folder follow win32/install.txt instructions.

Usually this means copy the win32/common-sample file to win32/common, and edit it to agree with your machine. If you've installed the database to your machine using default directories, you will most likely have to comment out sections of code, and uncomment the sections directly below.

```
PGSQLSRC="C:\Program Files\PostgreSQL\9.1"
LIBPQINC=$(PGSQLSRC)\include
LIBPQPATH=$(PGSQLSRC)\lib
LIBPQDLL=libpq.dll
LIBPQLIB=libpq.lib
LIBPQDPATH=$(PGSQLSRC)\lib
LIBPQDDLL=libpq.dll
LIBPQDLIB=libpq.lib
```

Copy the header files from sample-headers to your include/pqxx directory, for Visual Studio 2010 and libpq 9.0 you would copy the following files:

```
config\sample-headers\compiler\VisualStudio2010\pqxx\config-internal-compiler.h

config\sample-headers\compiler\VisualStudio2010\pqxx\config-public-compiler.h

config\sample-headers\libpq\9.0\pqxx\config-internal-libpq.h
```

To include\pqxx

For a 32-bit machine, you are ready to build it. Skip the next section.

# 64-bit only #
Edit the following file win32\vc-libpqxx.mak

Replace:

```
LINK_FLAGS_BASE=kernel32.lib ws2_32.lib advapi32.lib /nologo /dll /machine:I386 shell32.lib secur32.lib wldap32.lib
```

With:
```
LINK_FLAGS_BASE=kernel32.lib ws2_32.lib advapi32.lib /nologo /dll /machine:x64 shell32.lib secur32.lib wldap32.lib
```

The only change was the machine argument /machine:x64

# Build #
Open a command prompt and set your environment to allow you to build applications. Microsoft Visual Studio has an easy way to do this. From the start button, you can open "Visual Studio Command Prompt (2010)" to build 32 bit applications. To build 64 bit applications, there is a similarly named command prompt.

Run the following command:
```
nmake /f win32/vc-libpqxx.mak ALL
```

This should give you the libs and dlls that you need to build applications that link with libpqxx.

If you need to do more, you can read the install.txt more closely