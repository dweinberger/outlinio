<?php
class IAM_OPML_Parser
{
     var $parser;
     var $data;
     var $index = 0;
     var $currenttab=0;

	// Outline items we wish to map and their mapping names:  link_url, link_name, link_target, link_description...
	var $opml_map_vars = array('URL' => 'link_url', 'HTMLURL' => 'link_url', 'TEXT' => 'link_name', 'TITLE' => 'link_name',
								'TARGET' => 'link_target','DESCRIPTION' => 'link_description', 'XMLURL' => 'link_rss',
								"CREATED"=>'created', 'TYPE'=>'type');

     function OPML_Parser()
     {
          $this->parser = null;
          $this->data = '';
     }

	/**
	 * IAM_OPML_Parser::getContent()
	 * Fetch Contents of Page (from URL).
	 *
	 * @param string $url
	 * @return string contents of the page at $url
	 */
	function getContent($url='')
	{
		$ch = curl_init();
		curl_setopt ($ch, CURLOPT_URL, $url);
		curl_setopt ($ch, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt ($ch, CURLOPT_CONNECTTIMEOUT, 5);
		$html = curl_exec($ch);
		curl_close($ch);
		return $html;
	}

     function ParseElementStart($parser, $tagName, $attrs)
     {
		$map = $this->opml_map_vars;
		if ($tagName == 'OUTLINE')
		{
	          foreach (array_keys($this->opml_map_vars) as $key)
			{
	               if (isset($attrs[$key]))
				{
	                    $$map[$key] = $attrs[$key];
	               }
	          }
	          // save the data away.
	          $this->data[$this->index][names] = $link_name;
	          $this->data[$this->index][urls] = $link_url;
	          $this->data[$this->index][targets] = $link_target;
	          $this->data[$this->index][feeds] = $link_rss;
	          $this->data[$this->index][descriptions] = $link_description;
	          $this->data[$this->index][created] = $created;
	          $this->data[$this->index][type] = $type;
	          $this->index++;
	     } // end if outline
     }

	function ParseElementEnd($parser, $name)
     {
	     // nothing to do.
     }

	function ParseElementCharData($parser, $name)
     {
	     // nothing to do.
     }

     function Parse($XMLdata)
     {
          $this->parser = xml_parser_create();
          xml_set_object($this->parser, $this);

          xml_set_element_handler($this->parser,
               array(&$this, 'ParseElementStart'),
               array(&$this, 'ParseElementEnd'));

		xml_set_character_data_handler($this->parser,
			array(&$this, 'ParseElementCharData'));

          xml_parse($this->parser, $XMLdata);

          xml_parser_free($this->parser);

     }

var $ct;

	function list_contents($arrayname, $tab = "TAB", $indent = 0) // recursively displays contents of the array and sub-arrays:
	{
		 // This function (c) Peter Kionga-Kamau (http://www.pmkmedia.com)
		 // Free for unrestricted use, except sale - do not resell.
		 // use: echo LIST_CONTENTS(array $arrayname, string $tab, int $indent);
		 // $tab = string to use as a tab, $indent = number of tabs to indent result
		 while (list($key, $value) = each($arrayname))
		    
		 {
			  for($i = 0; $i < $indent; $i++) $ct = $i; //$currenttab .= $tab;
			     
			  if (is_array($value))
			  {
				   $retval .= "INDENT: $ct $key : Array: \r\n\r\n{<BR>";
				   $retval .= $this->list_contents($value, $tab, $indent + 1) . "$currenttab}<BR>";
				  
			  }
			  else
				$retval .= "$indent $key => $value<BR>";
				

			  $currenttab = null;
			  
		 }
		 return $retval;
	}
     function getFeeds($opml_url)
     {
		$this->index = 0;
		$this->Parse($this->getContent($opml_url));
		$this->index = 0;
		return $this->data;
	}

	function displayOPMLContents($opml_url, $tab = "-tab-")
	{
		echo $this->list_contents($this->getFeeds($opml_url), $tab, 0);
	}

}
?>