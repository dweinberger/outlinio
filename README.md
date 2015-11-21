# Outlinio

Work in process.

This is a simple broswer-based outliner. It does the basic thing of letting you create an outline of indented lines that can be folded or unfolded, dragged with all their children (when folded) or one line at a time.

The main advantage is that you can competely adjust its look via CSS templates. That's why I wrote this. Also because OmniOutliner's save-file format is incompatible with DropBox.

The disadvantages, besides it being crappy because I am an amateur:

1. It's designed to be run locally from localhost. So there are no provisions for multiple users.
2. To get access to your hard drive, you have to create a symbolic link to the folder you want to read and save to. I designed it with Dropbox in mind.

Note that if you create a symlink to Dropbox in Dropbox (as happened once when I saved a copy of these files into Dropbox), Dropbox will copy all of its files into itself. When you delete those copies, you will be deleting them from Dropbox itself. Bye-bye your files. So *do not put the symlink to Dropbox in Dropbox itself*.

Please read the above paragraph again.

David Weinberger
david@weinberger.org
November 21, 2015

License
Dual licensed under the MIT license (below) and GPL license.

GPL License
http://www.gnu.org/licenses/gpl-3.0.html

MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

This permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
